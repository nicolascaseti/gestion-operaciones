import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseIncomingMessage, sendWhatsAppMessage, sendWhatsAppConfirmation, normalizePhoneNumber } from '@/lib/whatsapp/service'
import { parseNaturalLanguageEntry, generateSummary, isValidEntry } from '@/lib/natural-language/parser'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

// Almacén temporal para entradas pendientes de confirmación
// En producción, usar Redis o similar
const pendingEntries = new Map<string, {
  tenantId: string
  parsed: ReturnType<typeof parseNaturalLanguageEntry>
  productId: number
  entityId: number | null
  entityName: string
  createEntity: boolean
  timestamp: number
}>()

// Limpiar entradas antiguas (más de 5 minutos)
function cleanOldEntries() {
  const now = Date.now()
  for (const [key, entry] of pendingEntries.entries()) {
    if (now - entry.timestamp > 5 * 60 * 1000) {
      pendingEntries.delete(key)
    }
  }
}

/**
 * GET - Verificación del webhook por Meta
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Verificar que es una solicitud de verificación válida
  if (mode === 'subscribe' && token && challenge) {
    // Buscar configuración con este token
    const config = await prisma.whatsAppConfig.findFirst({
      where: { webhookVerifyToken: token },
    })

    if (config) {
      console.log('WhatsApp webhook verified for tenant:', config.tenantId)
      return new NextResponse(challenge, { status: 200 })
    }
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/**
 * POST - Recibir mensajes de WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verificar que es un mensaje de WhatsApp
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' })
    }

    // Parsear el mensaje
    const message = parseIncomingMessage(body)
    if (!message) {
      return NextResponse.json({ status: 'no_message' })
    }

    console.log('WhatsApp message received:', message)

    // Limpiar entradas antiguas
    cleanOldEntries()

    // Normalizar número de teléfono
    const normalizedPhone = normalizePhoneNumber(message.from)

    // Buscar usuario por número de WhatsApp
    const user = await prisma.user.findFirst({
      where: { whatsappPhone: normalizedPhone },
      include: {
        tenant: {
          include: {
            whatsappConfig: true,
          },
        },
      },
    })

    if (!user || !user.tenant.whatsappConfig?.isActive) {
      console.log('User not found or WhatsApp not configured for:', normalizedPhone)
      // No respondemos para no revelar información
      return NextResponse.json({ status: 'user_not_found' })
    }

    const config = user.tenant.whatsappConfig
    const tenantId = user.tenantId

    // Verificar si es una respuesta a un botón de confirmación
    if (message.text === 'confirm_entry') {
      const pending = pendingEntries.get(normalizedPhone)
      if (pending && pending.tenantId === tenantId) {
        // Procesar la entrada confirmada
        const result = await processConfirmedEntry(pending, tenantId, message.text)
        pendingEntries.delete(normalizedPhone)

        await sendWhatsAppMessage(
          config.phoneNumberId!,
          config.accessToken!,
          message.from,
          result.success
            ? `✅ ${result.type === 'compra' ? 'Compra' : 'Venta'} registrada exitosamente!`
            : `❌ Error: ${result.error}`
        )
      } else {
        await sendWhatsAppMessage(
          config.phoneNumberId!,
          config.accessToken!,
          message.from,
          '⚠️ No hay ninguna operación pendiente de confirmar.'
        )
      }
      return NextResponse.json({ status: 'processed' })
    }

    if (message.text === 'cancel_entry') {
      pendingEntries.delete(normalizedPhone)
      await sendWhatsAppMessage(
        config.phoneNumberId!,
        config.accessToken!,
        message.from,
        '❌ Operación cancelada.'
      )
      return NextResponse.json({ status: 'cancelled' })
    }

    // Procesar como nuevo texto de entrada
    const parsed = parseNaturalLanguageEntry(message.text)
    const summary = generateSummary(parsed)

    if (!parsed.type) {
      await sendWhatsAppMessage(
        config.phoneNumberId!,
        config.accessToken!,
        message.from,
        '❓ No pude entender si es una compra o venta. Por favor incluye palabras como "compré", "vendí", etc.\n\nEjemplo: "Compré 10 unidades de PROD001 a Proveedor ABC por $500"'
      )
      return NextResponse.json({ status: 'invalid_type' })
    }

    if (!parsed.quantity || parsed.quantity <= 0) {
      await sendWhatsAppMessage(
        config.phoneNumberId!,
        config.accessToken!,
        message.from,
        '❓ No detecté la cantidad. Por favor incluye el número de unidades.\n\nEjemplo: "Vendí 5 unidades de producto X"'
      )
      return NextResponse.json({ status: 'invalid_quantity' })
    }

    // Buscar producto
    let product = null
    if (parsed.productIdentifier) {
      product = await prisma.product.findFirst({
        where: {
          tenantId,
          activo: true,
          OR: [
            { codigo: { equals: parsed.productIdentifier, mode: 'insensitive' } },
            { nombre: { contains: parsed.productIdentifier, mode: 'insensitive' } },
          ],
        },
      })
    }

    if (!product) {
      await sendWhatsAppMessage(
        config.phoneNumberId!,
        config.accessToken!,
        message.from,
        `❌ Producto "${parsed.productIdentifier || 'no especificado'}" no encontrado.\n\nPor favor verifica el código o nombre del producto.`
      )
      return NextResponse.json({ status: 'product_not_found' })
    }

    // Buscar o preparar creación de entidad (cliente/proveedor)
    let entityId: number | null = null
    let entityName = parsed.entityName || 'Sin nombre'
    let createEntity = false

    if (parsed.type === 'compra' && parsed.entityName) {
      const supplier = await prisma.supplier.findFirst({
        where: {
          tenantId,
          activo: true,
          nombre: { contains: parsed.entityName, mode: 'insensitive' },
        },
      })
      if (supplier) {
        entityId = supplier.id
        entityName = supplier.nombre
      } else {
        createEntity = true
      }
    } else if (parsed.type === 'venta' && parsed.entityName) {
      const customer = await prisma.customer.findFirst({
        where: {
          tenantId,
          activo: true,
          nombre: { contains: parsed.entityName, mode: 'insensitive' },
        },
      })
      if (customer) {
        entityId = customer.id
        entityName = customer.nombre
      } else {
        createEntity = true
      }
    }

    // Calcular precio
    const unitPrice = parsed.unitPrice ||
      (parsed.type === 'compra' ? Number(product.costoDefault) : Number(product.precioDefault))
    const total = parsed.quantity * unitPrice

    // Guardar entrada pendiente
    pendingEntries.set(normalizedPhone, {
      tenantId,
      parsed,
      productId: product.id,
      entityId,
      entityName,
      createEntity,
      timestamp: Date.now(),
    })

    // Construir mensaje de confirmación
    const entityLabel = parsed.type === 'compra' ? 'Proveedor' : 'Cliente'
    const priceLabel = parsed.type === 'compra' ? 'Costo' : 'Precio'

    let confirmBody = `📦 Producto: ${product.codigo} - ${product.nombre}\n`
    confirmBody += `🔢 Cantidad: ${parsed.quantity}\n`
    confirmBody += `💰 ${priceLabel}: $${unitPrice.toLocaleString('es-AR')} c/u\n`
    confirmBody += `💵 Total: $${total.toLocaleString('es-AR')}\n`
    confirmBody += `👤 ${entityLabel}: ${entityName}`
    if (createEntity) {
      confirmBody += ' (se creará)'
    }

    await sendWhatsAppConfirmation(
      config.phoneNumberId!,
      config.accessToken!,
      message.from,
      parsed.type === 'compra' ? '🛒 Nueva Compra' : '💰 Nueva Venta',
      confirmBody,
      '✅ Confirmar',
      '❌ Cancelar'
    )

    return NextResponse.json({ status: 'confirmation_sent' })
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

/**
 * Procesa una entrada confirmada
 */
async function processConfirmedEntry(
  pending: {
    tenantId: string
    parsed: ReturnType<typeof parseNaturalLanguageEntry>
    productId: number
    entityId: number | null
    entityName: string
    createEntity: boolean
  },
  tenantId: string,
  originalText: string
): Promise<{ success: boolean; type?: string; error?: string }> {
  try {
    const { parsed, productId, entityId, entityName, createEntity } = pending

    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId },
    })

    if (!product) {
      return { success: false, error: 'Producto no encontrado' }
    }

    const unitPrice = parsed.unitPrice ||
      (parsed.type === 'compra' ? Number(product.costoDefault) : Number(product.precioDefault))

    if (parsed.type === 'compra') {
      // Crear proveedor si es necesario
      let supplierId = entityId
      if (!supplierId) {
        if (createEntity && entityName) {
          const newSupplier = await prisma.supplier.create({
            data: { tenantId, nombre: entityName, activo: true },
          })
          supplierId = newSupplier.id
        } else {
          return { success: false, error: 'Proveedor no especificado' }
        }
      }

      const costoTotal = parsed.quantity! * unitPrice

      await prisma.purchase.create({
        data: {
          tenantId,
          fecha: new Date(),
          proveedorId: supplierId,
          productoId: product.id,
          codigoProducto: product.codigo,
          nombreProducto: product.nombre,
          cantidad: new Decimal(parsed.quantity!),
          costoUnitario: new Decimal(unitPrice),
          costoTotal: new Decimal(costoTotal),
          notas: 'Registro por WhatsApp',
        },
      })

      return { success: true, type: 'compra' }
    } else {
      // Venta
      let clienteId = entityId
      if (!clienteId) {
        if (createEntity && entityName) {
          const newCustomer = await prisma.customer.create({
            data: { tenantId, nombre: entityName, activo: true },
          })
          clienteId = newCustomer.id
        } else {
          return { success: false, error: 'Cliente no especificado' }
        }
      }

      // Obtener forma de pago por defecto
      const defaultPaymentMethod = await prisma.paymentMethod.findFirst({
        where: { tenantId, activo: true },
        orderBy: { id: 'asc' },
      })

      if (!defaultPaymentMethod) {
        return { success: false, error: 'No hay forma de pago configurada' }
      }

      const ventaTotal = parsed.quantity! * unitPrice
      const costoAsignado = parsed.quantity! * Number(product.costoDefault)
      const ganancia = ventaTotal - costoAsignado
      const margenPorcentaje = ventaTotal > 0 ? (ganancia / ventaTotal) * 100 : 0

      await prisma.sale.create({
        data: {
          tenantId,
          fecha: new Date(),
          formaPagoId: defaultPaymentMethod.id,
          clienteId,
          productoId: product.id,
          codigoProducto: product.codigo,
          nombreProducto: product.nombre,
          unidades: new Decimal(parsed.quantity!),
          precioUnitario: new Decimal(unitPrice),
          ventaTotal: new Decimal(ventaTotal),
          costoAsignado: new Decimal(costoAsignado),
          ganancia: new Decimal(ganancia),
          margenPorcentaje: new Decimal(margenPorcentaje),
          notas: 'Registro por WhatsApp',
        },
      })

      return { success: true, type: 'venta' }
    }
  } catch (error) {
    console.error('Error processing confirmed entry:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
