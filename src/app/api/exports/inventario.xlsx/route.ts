import { NextResponse } from 'next/server'
import { getInventory } from '@/lib/inventory'
import { createWorkbook, setupWorksheet, autosizeColumns, EXCEL_CONFIG } from '@/lib/excel/config'
import { format } from 'date-fns'

export async function GET() {
  try {
    const inventory = await getInventory()

    const workbook = createWorkbook()
    const worksheet = workbook.addWorksheet('Inventario')

    setupWorksheet(worksheet, [
      { header: 'Codigo', key: 'codigo', width: 15 },
      { header: 'Producto', key: 'nombre', width: 30 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Stock Inicial', key: 'stockInicial', width: 15 },
      { header: 'Entradas', key: 'entradas', width: 12 },
      { header: 'Salidas', key: 'salidas', width: 12 },
      { header: 'Stock Actual', key: 'stockActual', width: 15 },
      { header: 'Costo Unitario', key: 'costoUnitario', width: 15 },
      { header: 'Valor Total', key: 'valorTotal', width: 15 },
      { header: 'Precio Venta', key: 'precioVenta', width: 15 },
      { header: 'Margen (%)', key: 'margen', width: 12 },
      { header: 'Estado', key: 'estado', width: 12 },
    ])

    if (inventory.length === 0) {
      const row = worksheet.addRow({
        codigo: 'Sin datos',
        nombre: '',
        categoria: '',
        stockInicial: '',
        entradas: '',
        salidas: '',
        stockActual: '',
        costoUnitario: '',
        valorTotal: '',
        precioVenta: '',
        margen: '',
        estado: 'No hay productos en el inventario',
      })
      row.getCell('codigo').font = { italic: true }
    } else {
      let totalValor = 0
      let totalUnidades = 0

      inventory.forEach((item) => {
        const row = worksheet.addRow({
          codigo: item.codigo,
          nombre: item.nombre,
          categoria: item.categoria || '',
          stockInicial: item.stockInicial,
          entradas: item.entradas,
          salidas: item.salidas,
          stockActual: item.stockActual,
          costoUnitario: item.costoUnitario,
          valorTotal: item.valorTotal,
          precioVenta: item.precioVenta,
          margen: item.margen,
          estado: item.estado === 'agotado' ? 'Agotado' : item.estado === 'bajo' ? 'Stock bajo' : 'Normal',
        })

        row.getCell('costoUnitario').numFmt = EXCEL_CONFIG.currencyFormat
        row.getCell('valorTotal').numFmt = EXCEL_CONFIG.currencyFormat
        row.getCell('precioVenta').numFmt = EXCEL_CONFIG.currencyFormat
        row.getCell('margen').numFmt = EXCEL_CONFIG.percentFormat

        // Color por estado
        if (item.estado === 'agotado') {
          row.getCell('estado').font = { color: { argb: 'FFFF0000' }, bold: true }
          row.getCell('stockActual').font = { color: { argb: 'FFFF0000' } }
        } else if (item.estado === 'bajo') {
          row.getCell('estado').font = { color: { argb: 'FFFF9800' }, bold: true }
          row.getCell('stockActual').font = { color: { argb: 'FFFF9800' } }
        } else {
          row.getCell('estado').font = { color: { argb: 'FF008000' } }
        }

        // Color margen
        if (item.margen >= 30) {
          row.getCell('margen').font = { color: { argb: 'FF008000' } }
        } else if (item.margen >= 15) {
          row.getCell('margen').font = { color: { argb: 'FFFF9800' } }
        } else {
          row.getCell('margen').font = { color: { argb: 'FFFF0000' } }
        }

        totalValor += item.valorTotal
        totalUnidades += item.stockActual
      })

      // Fila de totales
      const totalRow = worksheet.addRow({
        codigo: '',
        nombre: 'TOTALES',
        categoria: '',
        stockInicial: '',
        entradas: '',
        salidas: '',
        stockActual: totalUnidades,
        costoUnitario: '',
        valorTotal: totalValor,
        precioVenta: '',
        margen: '',
        estado: '',
      })

      totalRow.font = { bold: true }
      totalRow.getCell('valorTotal').numFmt = EXCEL_CONFIG.currencyFormat
    }

    autosizeColumns(worksheet)

    const buffer = await workbook.xlsx.writeBuffer()
    const filename = `inventario_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating inventory export:', error)
    return NextResponse.json(
      { error: 'Error al generar el archivo Excel' },
      { status: 500 }
    )
  }
}
