import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createWorkbook, setupWorksheet, autosizeColumns, EXCEL_CONFIG } from '@/lib/excel/config'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')
    const clienteId = searchParams.get('clienteId')
    const formaPagoId = searchParams.get('formaPagoId')
    const productoId = searchParams.get('productoId')

    const where = {
      ...(fechaDesde &&
        fechaHasta && {
          fecha: {
            gte: new Date(fechaDesde),
            lte: new Date(fechaHasta + 'T23:59:59'),
          },
        }),
      ...(clienteId && { clienteId: parseInt(clienteId) }),
      ...(formaPagoId && { formaPagoId: parseInt(formaPagoId) }),
      ...(productoId && { productoId: parseInt(productoId) }),
    }

    const ventas = await prisma.sale.findMany({
      where,
      include: {
        cliente: true,
        formaPago: true,
        producto: true,
      },
      orderBy: { fecha: 'desc' },
    })

    const workbook = createWorkbook()
    const worksheet = workbook.addWorksheet('Ventas')

    setupWorksheet(worksheet, [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Forma de Pago', key: 'formaPago', width: 18 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Codigo Producto', key: 'codigo', width: 15 },
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Unidades', key: 'unidades', width: 12 },
      { header: 'Precio Unitario', key: 'precioUnitario', width: 15 },
      { header: 'Venta Total', key: 'ventaTotal', width: 15 },
      { header: 'Costo Asignado', key: 'costoAsignado', width: 15 },
      { header: 'Ganancia ($)', key: 'ganancia', width: 15 },
      { header: 'Margen (%)', key: 'margen', width: 12 },
      { header: 'N° Venta', key: 'id', width: 12 },
      { header: 'Notas', key: 'notas', width: 30 },
    ])

    if (ventas.length === 0) {
      const row = worksheet.addRow({
        fecha: 'Sin datos',
        formaPago: '',
        cliente: '',
        codigo: '',
        producto: '',
        unidades: '',
        precioUnitario: '',
        ventaTotal: '',
        costoAsignado: '',
        ganancia: '',
        margen: '',
        id: '',
        notas: 'No se encontraron ventas con los filtros seleccionados',
      })
      row.getCell('fecha').font = { italic: true }
    } else {
      ventas.forEach((venta) => {
        const row = worksheet.addRow({
          fecha: format(venta.fecha, 'dd/MM/yyyy'),
          formaPago: venta.formaPago.nombre,
          cliente: venta.cliente.nombre,
          codigo: venta.codigoProducto,
          producto: venta.nombreProducto,
          unidades: Number(venta.unidades),
          precioUnitario: Number(venta.precioUnitario),
          ventaTotal: Number(venta.ventaTotal),
          costoAsignado: Number(venta.costoAsignado),
          ganancia: Number(venta.ganancia),
          margen: Number(venta.margenPorcentaje),
          id: venta.id,
          notas: venta.notas || '',
        })

        row.getCell('precioUnitario').numFmt = EXCEL_CONFIG.currencyFormat
        row.getCell('ventaTotal').numFmt = EXCEL_CONFIG.currencyFormat
        row.getCell('costoAsignado').numFmt = EXCEL_CONFIG.currencyFormat
        row.getCell('ganancia').numFmt = EXCEL_CONFIG.currencyFormat
        row.getCell('margen').numFmt = EXCEL_CONFIG.percentFormat

        // Color ganancia
        const gananciaValue = Number(venta.ganancia)
        if (gananciaValue < 0) {
          row.getCell('ganancia').font = { color: { argb: 'FFFF0000' } }
          row.getCell('margen').font = { color: { argb: 'FFFF0000' } }
        } else {
          row.getCell('ganancia').font = { color: { argb: 'FF008000' } }
          row.getCell('margen').font = { color: { argb: 'FF008000' } }
        }
      })
    }

    autosizeColumns(worksheet)

    const buffer = await workbook.xlsx.writeBuffer()
    const filename = `ventas_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating sales export:', error)
    return NextResponse.json(
      { error: 'Error al generar el archivo Excel' },
      { status: 500 }
    )
  }
}
