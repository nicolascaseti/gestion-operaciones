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

    // Obtener productos y proveedores para validacion
    const productos = await prisma.product.findMany({
      where: { tenantId, activo: true },
      select: { id: true, codigo: true, nombre: true, costoDefault: true },
    })
    const proveedores = await prisma.supplier.findMany({
      where: { tenantId, activo: true },
      select: { id: true, nombre: true },
    })

    const productosMap = new Map(
      productos.map((p) => [p.codigo.toLowerCase(), p])
    )
    const productosByName = new Map(
      productos.map((p) => [p.nombre.toLowerCase(), p])
    )
    const proveedoresMap = new Map(
      proveedores.map((p) => [p.nombre.toLowerCase(), p])
    )

    const errors: ImportError[] = []
    const validPurchases: {
      tenantId: string
      fecha: Date
      proveedorId: number
      productoId: number
      codigoProducto: string
      nombreProducto: string
      cantidad: Decimal
      costoUnitario: Decimal
      costoTotal: Decimal
      notas: string | null
    }[] = []

    for (const row of rows) {
      const rowNum = row._rowNumber as number

      // Parsear fecha
      const fecha = parseDate(
        row['fecha'] || row['date'] || row['fecha_compra']
      )
      if (!fecha) {
        errors.push({ row: rowNum, message: 'Fecha invalida o faltante' })
        continue
      }

      // Buscar proveedor
      const proveedorNombre = (
        (row['proveedor'] || row['supplier'] || row['nombre_proveedor']) as string
      )?.toLowerCase()
      const proveedor = proveedorNombre
        ? proveedoresMap.get(proveedorNombre)
        : null
      if (!proveedor) {
        errors.push({
          row: rowNum,
          message: `Proveedor no encontrado: ${proveedorNombre || 'vacio'}`,
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

      // Parsear cantidad
      const cantidad = parseNumber(
        row['cantidad'] || row['qty'] || row['unidades']
      )
      if (!cantidad || cantidad <= 0) {
        errors.push({ row: rowNum, message: 'Cantidad invalida o faltante' })
        continue
      }

      // Parsear costo unitario (usar default si no se proporciona)
      let costoUnitario = parseNumber(
        row['costo'] ||
          row['costo_unitario'] ||
          row['precio'] ||
          row['unit_cost']
      )
      if (!costoUnitario || costoUnitario < 0) {
        costoUnitario = Number(producto.costoDefault)
      }

      const costoTotal = cantidad * costoUnitario

      // Notas
      const notas =
        ((row['notas'] || row['notes'] || row['observaciones']) as string) ||
        null

      validPurchases.push({
        tenantId,
        fecha,
        proveedorId: proveedor.id,
        productoId: producto.id,
        codigoProducto: producto.codigo,
        nombreProducto: producto.nombre,
        cantidad: new Decimal(cantidad),
        costoUnitario: new Decimal(costoUnitario),
        costoTotal: new Decimal(costoTotal),
        notas,
      })
    }

    // Insertar compras validas
    if (validPurchases.length > 0) {
      await prisma.purchase.createMany({
        data: validPurchases,
      })
    }

    return NextResponse.json({
      success: validPurchases.length,
      errors,
    })
  } catch (error) {
    console.error('Error importing purchases:', error)
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
