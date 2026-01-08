import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createWorkbook, setupWorksheet, autosizeColumns, EXCEL_CONFIG } from '@/lib/excel/config'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')
    const proveedorId = searchParams.get('proveedorId')
    const productoId = searchParams.get('productoId')

    const where = {
      ...(fechaDesde &&
        fechaHasta && {
          fecha: {
            gte: new Date(fechaDesde),
            lte: new Date(fechaHasta + 'T23:59:59'),
          },
        }),
      ...(proveedorId && { proveedorId: parseInt(proveedorId) }),
      ...(productoId && { productoId: parseInt(productoId) }),
    }

    const compras = await prisma.purchase.findMany({
      where,
      include: {
        proveedor: true,
        producto: true,
      },
      orderBy: { fecha: 'desc' },
    })

    const workbook = createWorkbook()
    const worksheet = workbook.addWorksheet('Compras')

    setupWorksheet(worksheet, [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Proveedor', key: 'proveedor', width: 25 },
      { header: 'Codigo Producto', key: 'codigo', width: 15 },
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Cantidad', key: 'cantidad', width: 12 },
      { header: 'Costo Unitario', key: 'costoUnitario', width: 15 },
      { header: 'Costo Total', key: 'costoTotal', width: 15 },
      { header: 'N° Compra', key: 'id', width: 12 },
      { header: 'Notas', key: 'notas', width: 30 },
    ])

    if (compras.length === 0) {
      const row = worksheet.addRow({
        fecha: 'Sin datos',
        proveedor: '',
        codigo: '',
        producto: '',
        cantidad: '',
        costoUnitario: '',
        costoTotal: '',
        id: '',
        notas: 'No se encontraron compras con los filtros seleccionados',
      })
      row.getCell('fecha').font = { italic: true }
    } else {
      compras.forEach((compra) => {
        const row = worksheet.addRow({
          fecha: format(compra.fecha, 'dd/MM/yyyy'),
          proveedor: compra.proveedor.nombre,
          codigo: compra.codigoProducto,
          producto: compra.nombreProducto,
          cantidad: Number(compra.cantidad),
          costoUnitario: Number(compra.costoUnitario),
          costoTotal: Number(compra.costoTotal),
          id: compra.id,
          notas: compra.notas || '',
        })

        row.getCell('costoUnitario').numFmt = EXCEL_CONFIG.currencyFormat
        row.getCell('costoTotal').numFmt = EXCEL_CONFIG.currencyFormat
      })
    }

    autosizeColumns(worksheet)

    const buffer = await workbook.xlsx.writeBuffer()
    const filename = `compras_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating purchases export:', error)
    return NextResponse.json(
      { error: 'Error al generar el archivo Excel' },
      { status: 500 }
    )
  }
}
