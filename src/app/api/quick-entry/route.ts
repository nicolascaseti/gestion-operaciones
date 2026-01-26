import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantId } from '@/lib/session'
import { parseNaturalLanguageEntry, isValidEntry, generateSummary } from '@/lib/natural-language/parser'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

interface ParseResponse {
  parsed: {
    type: 'compra' | 'venta' | null
    quantity: number | null
    productIdentifier: string | null
    entityName: string | null
    unitPrice: number | null
    confidence: number
    warnings: string[]
  }
  summary: string
  validation: {
    isValid: boolean
    product: {
      found: boolean
      id: number | null
      codigo: string | null
      nombre: string | null
      costoDefault: number | null
      precioDefault: number | null
    } | null
    entity: {
      found: boolean
      id: number | null
      nombre: string | null
      willCreate: boolean
    } | null
    paymentMethod: {
      id: number | null
      nombre: string | null
    } | null
    errors: string[]
  }
}

// POST /api/quick-entry - Parsea el texto y devuelve la vista previa
export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await request.json()
    const { text, action } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere el texto a analizar' },
        { status: 400 }
      )
    }

    // Parsear el texto
    const parsed = parseNaturalLanguageEntry(text)
    const summary = generateSummary(parsed)

    // Si solo se pide el parsing, devolverlo
    if (action === 'parse') {
      // Buscar producto en la base de datos
      let productValidation = null
      if (parsed.productIdentifier) {
        const product = await prisma.product.findFirst({
          where: {
            tenantId,
            activo: true,
            OR: [
              { codigo: { equals: parsed.productIdentifier, mode: 'insensitive' } },
              { nombre: { contains: parsed.productIdentifier, mode: 'insensitive' } },
            ],
          },
        })

        productValidation = {
          found: !!product,
          id: product?.id || null,
          codigo: product?.codigo || null,
          nombre: product?.nombre || null,
          costoDefault: product ? Number(product.costoDefault) : null,
          precioDefault: product ? Number(product.precioDefault) : null,
        }
      }

      // Buscar entidad (cliente o proveedor)
      let entityValidation = null
      if (parsed.entityName) {
        if (parsed.type === 'compra') {
          const supplier = await prisma.supplier.findFirst({
            where: {
              tenantId,
              activo: true,
              nombre: { contains: parsed.entityName, mode: 'insensitive' },
            },
          })
          entityValidation = {
            found: !!supplier,
            id: supplier?.id || null,
            nombre: supplier?.nombre || parsed.entityName,
            willCreate: !supplier,
          }
        } else if (parsed.type === 'venta') {
          const customer = await prisma.customer.findFirst({
            where: {
              tenantId,
              activo: true,
              nombre: { contains: parsed.entityName, mode: 'insensitive' },
            },
          })
          entityValidation = {
            found: !!customer,
            id: customer?.id || null,
            nombre: customer?.nombre || parsed.entityName,
            willCreate: !customer,
          }
        }
      }

      // Obtener forma de pago por defecto para ventas
      let paymentMethodValidation = null
      if (parsed.type === 'venta') {
        const defaultPaymentMethod = await prisma.paymentMethod.findFirst({
          where: { tenantId, activo: true },
          orderBy: { id: 'asc' },
        })
        if (defaultPaymentMethod) {
          paymentMethodValidation = {
            id: defaultPaymentMethod.id,
            nombre: defaultPaymentMethod.nombre,
          }
        }
      }

      // Generar errores de validación
      const errors: string[] = []
      if (!parsed.type) {
        errors.push('No se pudo determinar si es una compra o venta')
      }
      if (!parsed.quantity || parsed.quantity <= 0) {
        errors.push('No se detectó una cantidad válida')
      }
      if (!productValidation?.found) {
        if (parsed.productIdentifier) {
          errors.push(`Producto "${parsed.productIdentifier}" no encontrado en el catálogo`)
        } else {
          errors.push('No se detectó el producto')
        }
      }
      if (parsed.type === 'venta' && !paymentMethodValidation) {
        errors.push('No hay formas de pago registradas')
      }

      const response: ParseResponse = {
        parsed: {
          type: parsed.type,
          quantity: parsed.quantity,
          productIdentifier: parsed.productIdentifier,
          entityName: parsed.entityName,
          unitPrice: parsed.unitPrice,
          confidence: parsed.confidence,
          warnings: parsed.warnings,
        },
        summary,
        validation: {
          isValid: errors.length === 0,
          product: productValidation,
          entity: entityValidation,
          paymentMethod: paymentMethodValidation,
          errors,
        },
      }

      return NextResponse.json(response)
    }

    // Si se pide crear, validar y crear la operación
    if (action === 'submit') {
      const { productId, entityId, createEntity, createProduct, paymentMethodId, unitPrice } = body

      if (!parsed.type) {
        return NextResponse.json(
          { error: 'No se pudo determinar el tipo de operación' },
          { status: 400 }
        )
      }

      if (!parsed.quantity || parsed.quantity <= 0) {
        return NextResponse.json(
          { error: 'Cantidad inválida' },
          { status: 400 }
        )
      }

      // Buscar o crear producto
      let product = null
      if (productId) {
        product = await prisma.product.findFirst({
          where: { id: productId, tenantId },
        })
      } else if (createProduct && parsed.productIdentifier) {
        // Crear producto nuevo
        const codigo = parsed.productIdentifier.toUpperCase().replace(/\s+/g, '-')
        product = await prisma.product.create({
          data: {
            tenantId,
            codigo,
            nombre: parsed.productIdentifier,
            costoDefault: unitPrice || 0,
            precioDefault: unitPrice || 0,
            activo: true,
          },
        })
      }

      if (!product) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        )
      }

      // Determinar precio/costo
      const finalUnitPrice = unitPrice ||
        (parsed.type === 'compra' ? Number(product.costoDefault) : Number(product.precioDefault)) ||
        parsed.unitPrice || 0

      if (parsed.type === 'compra') {
        // Buscar o crear proveedor
        let supplierId = entityId
        if (!supplierId && createEntity && parsed.entityName) {
          const newSupplier = await prisma.supplier.create({
            data: {
              tenantId,
              nombre: parsed.entityName,
              activo: true,
            },
          })
          supplierId = newSupplier.id
        } else if (!supplierId && parsed.entityName) {
          const supplier = await prisma.supplier.findFirst({
            where: {
              tenantId,
              activo: true,
              nombre: { contains: parsed.entityName, mode: 'insensitive' },
            },
          })
          if (supplier) {
            supplierId = supplier.id
          } else {
            // Auto-crear proveedor
            const newSupplier = await prisma.supplier.create({
              data: {
                tenantId,
                nombre: parsed.entityName,
                activo: true,
              },
            })
            supplierId = newSupplier.id
          }
        }

        if (!supplierId) {
          return NextResponse.json(
            { error: 'Proveedor no especificado' },
            { status: 400 }
          )
        }

        const costoTotal = parsed.quantity * finalUnitPrice

        const compra = await prisma.purchase.create({
          data: {
            tenantId,
            fecha: new Date(),
            proveedorId: supplierId,
            productoId: product.id,
            codigoProducto: product.codigo,
            nombreProducto: product.nombre,
            cantidad: new Decimal(parsed.quantity),
            costoUnitario: new Decimal(finalUnitPrice),
            costoTotal: new Decimal(costoTotal),
            notas: `Registro rápido: "${text}"`,
          },
          include: {
            proveedor: true,
            producto: true,
          },
        })

        return NextResponse.json({
          success: true,
          type: 'compra',
          data: compra,
        })
      } else {
        // Venta
        // Buscar o crear cliente
        let clienteId = entityId
        if (!clienteId && createEntity && parsed.entityName) {
          const newCustomer = await prisma.customer.create({
            data: {
              tenantId,
              nombre: parsed.entityName,
              activo: true,
            },
          })
          clienteId = newCustomer.id
        } else if (!clienteId && parsed.entityName) {
          const customer = await prisma.customer.findFirst({
            where: {
              tenantId,
              activo: true,
              nombre: { contains: parsed.entityName, mode: 'insensitive' },
            },
          })
          if (customer) {
            clienteId = customer.id
          } else {
            // Auto-crear cliente
            const newCustomer = await prisma.customer.create({
              data: {
                tenantId,
                nombre: parsed.entityName,
                activo: true,
              },
            })
            clienteId = newCustomer.id
          }
        }

        if (!clienteId) {
          return NextResponse.json(
            { error: 'Cliente no especificado' },
            { status: 400 }
          )
        }

        // Obtener forma de pago
        let formaPagoId = paymentMethodId
        if (!formaPagoId) {
          const defaultPaymentMethod = await prisma.paymentMethod.findFirst({
            where: { tenantId, activo: true },
            orderBy: { id: 'asc' },
          })
          if (defaultPaymentMethod) {
            formaPagoId = defaultPaymentMethod.id
          }
        }

        if (!formaPagoId) {
          return NextResponse.json(
            { error: 'No hay forma de pago disponible' },
            { status: 400 }
          )
        }

        const ventaTotal = parsed.quantity * finalUnitPrice
        const costoAsignado = parsed.quantity * Number(product.costoDefault)
        const ganancia = ventaTotal - costoAsignado
        const margenPorcentaje = ventaTotal > 0 ? (ganancia / ventaTotal) * 100 : 0

        const venta = await prisma.sale.create({
          data: {
            tenantId,
            fecha: new Date(),
            formaPagoId,
            clienteId,
            productoId: product.id,
            codigoProducto: product.codigo,
            nombreProducto: product.nombre,
            unidades: new Decimal(parsed.quantity),
            precioUnitario: new Decimal(finalUnitPrice),
            ventaTotal: new Decimal(ventaTotal),
            costoAsignado: new Decimal(costoAsignado),
            ganancia: new Decimal(ganancia),
            margenPorcentaje: new Decimal(margenPorcentaje),
            notas: `Registro rápido: "${text}"`,
          },
          include: {
            cliente: true,
            formaPago: true,
            producto: true,
          },
        })

        return NextResponse.json({
          success: true,
          type: 'venta',
          data: venta,
        })
      }
    }

    return NextResponse.json(
      { error: 'Acción no válida. Use "parse" o "submit"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in quick entry:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error al procesar la solicitud',
      },
      { status: 500 }
    )
  }
}
