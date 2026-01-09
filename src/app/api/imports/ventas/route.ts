import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantId } from '@/lib/session'
import { parseExcelFile, parseDate, parseNumber } from '@/lib/excel/import'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

interface ImportError {
  row: number
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporciono ningun archivo' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const rows = await parseExcelFile(buffer)

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El archivo no contiene datos' },
        { status: 400 }
      )
    }

    // Obtener datos para validacion
    const productos = await prisma.product.findMany({
      where: { tenantId, activo: true },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        costoDefault: true,
        precioDefault: true,
      },
    })
    const clientes = await prisma.customer.findMany({
      where: { tenantId, activo: true },
      select: { id: true, nombre: true },
    })
    const formasPago = await prisma.paymentMethod.findMany({
      where: { tenantId, activo: true },
      select: { id: true, nombre: true },
    })

    const productosMap = new Map(
      productos.map((p) => [p.codigo.toLowerCase(), p])
    )
    const productosByName = new Map(
      productos.map((p) => [p.nombre.toLowerCase(), p])
    )
    const clientesMap = new Map(
      clientes.map((c) => [c.nombre.toLowerCase(), c])
    )
    const formasPagoMap = new Map(
      formasPago.map((fp) => [fp.nombre.toLowerCase(), fp])
    )

    const errors: ImportError[] = []
    const validSales: {
      tenantId: string
      fecha: Date
      formaPagoId: number
      clienteId: number
      productoId: number
      codigoProducto: string
      nombreProducto: string
      unidades: Decimal
      precioUnitario: Decimal
      ventaTotal: Decimal
      costoAsignado: Decimal
      ganancia: Decimal
      margenPorcentaje: Decimal
      notas: string | null
    }[] = []

    for (const row of rows) {
      const rowNum = row._rowNumber as number

      // Parsear fecha
      const fecha = parseDate(
        row['fecha'] || row['date'] || row['fecha_venta']
      )
      if (!fecha) {
        errors.push({ row: rowNum, message: 'Fecha invalida o faltante' })
        continue
      }

      // Buscar cliente
      const clienteNombre = (
        (row['cliente'] || row['customer'] || row['nombre_cliente']) as string
      )?.toLowerCase()
      const cliente = clienteNombre ? clientesMap.get(clienteNombre) : null
      if (!cliente) {
        errors.push({
          row: rowNum,
          message: `Cliente no encontrado: ${clienteNombre || 'vacio'}`,
        })
        continue
      }

      // Buscar forma de pago
      const formaPagoNombre = (
        (row['forma_pago'] ||
          row['formapago'] ||
          row['forma de pago'] ||
          row['payment']) as string
      )?.toLowerCase()
      const formaPago = formaPagoNombre
        ? formasPagoMap.get(formaPagoNombre)
        : null
      if (!formaPago) {
        errors.push({
          row: rowNum,
          message: `Forma de pago no encontrada: ${formaPagoNombre || 'vacio'}`,
        })
        continue
      }

      // Buscar producto por codigo o nombre
      const codigoProducto = (
        (row['codigo'] || row['codigo_producto'] || row['code']) as string
      )?.toLowerCase()
      const nombreProducto = (
        (row['producto'] || row['nombre_producto'] || row['product']) as string
      )?.toLowerCase()

      let producto = codigoProducto ? productosMap.get(codigoProducto) : null
      if (!producto && nombreProducto) {
        producto = productosByName.get(nombreProducto)
      }

      if (!producto) {
        errors.push({
          row: rowNum,
          message: `Producto no encontrado: ${codigoProducto || nombreProducto || 'vacio'}`,
        })
        continue
      }

      // Parsear unidades
      const unidades = parseNumber(
        row['unidades'] || row['cantidad'] || row['qty']
      )
      if (!unidades || unidades <= 0) {
        errors.push({ row: rowNum, message: 'Unidades invalidas o faltantes' })
        continue
      }

      // Parsear precio unitario (usar default si no se proporciona)
      let precioUnitario = parseNumber(
        row['precio'] ||
          row['precio_unitario'] ||
          row['unit_price']
      )
      if (!precioUnitario || precioUnitario < 0) {
        precioUnitario = Number(producto.precioDefault)
      }

      // Parsear costo asignado (usar default si no se proporciona)
      let costoAsignado = parseNumber(
        row['costo'] || row['costo_unitario'] || row['cost']
      )
      if (!costoAsignado || costoAsignado < 0) {
        costoAsignado = Number(producto.costoDefault)
      }

      const ventaTotal = unidades * precioUnitario
      const costoTotal = unidades * costoAsignado
      const ganancia = ventaTotal - costoTotal
      const margenPorcentaje = ventaTotal > 0 ? (ganancia / ventaTotal) * 100 : 0

      // Notas
      const notas =
        ((row['notas'] || row['notes'] || row['observaciones']) as string) ||
        null

      validSales.push({
        tenantId,
        fecha,
        formaPagoId: formaPago.id,
        clienteId: cliente.id,
        productoId: producto.id,
        codigoProducto: producto.codigo,
        nombreProducto: producto.nombre,
        unidades: new Decimal(unidades),
        precioUnitario: new Decimal(precioUnitario),
        ventaTotal: new Decimal(ventaTotal),
        costoAsignado: new Decimal(costoTotal),
        ganancia: new Decimal(ganancia),
        margenPorcentaje: new Decimal(margenPorcentaje),
        notas,
      })
    }

    // Insertar ventas validas
    if (validSales.length > 0) {
      await prisma.sale.createMany({
        data: validSales,
      })
    }

    return NextResponse.json({
      success: validSales.length,
      errors,
    })
  } catch (error) {
    console.error('Error importing sales:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al procesar el archivo',
      },
      { status: 500 }
    )
  }
}
