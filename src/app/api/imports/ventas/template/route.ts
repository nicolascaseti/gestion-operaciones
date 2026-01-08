import { NextResponse } from 'next/server'
import { createWorkbook, setupWorksheet, autosizeColumns } from '@/lib/excel/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const workbook = createWorkbook()
    const worksheet = workbook.addWorksheet('Ventas')

    setupWorksheet(worksheet, [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Forma_Pago', key: 'forma_pago', width: 18 },
      { header: 'Codigo', key: 'codigo', width: 15 },
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Unidades', key: 'unidades', width: 12 },
      { header: 'Precio_Unitario', key: 'precio_unitario', width: 15 },
      { header: 'Costo_Unitario', key: 'costo_unitario', width: 15 },
      { header: 'Notas', key: 'notas', width: 30 },
    ])

    // Agregar fila de ejemplo
    const exampleRow = worksheet.addRow({
      fecha: '15/01/2024',
      cliente: 'Nombre del Cliente',
      forma_pago: 'Efectivo',
      codigo: 'PROD001',
      producto: 'Nombre del Producto',
      unidades: 5,
      precio_unitario: 250.00,
      costo_unitario: 150.50,
      notas: 'Notas opcionales',
    })
    exampleRow.font = { italic: true, color: { argb: 'FF888888' } }

    // Agregar instrucciones
    const instructionsSheet = workbook.addWorksheet('Instrucciones')
    instructionsSheet.columns = [
      { header: 'Campo', key: 'campo', width: 20 },
      { header: 'Descripcion', key: 'descripcion', width: 50 },
      { header: 'Requerido', key: 'requerido', width: 12 },
      { header: 'Formato', key: 'formato', width: 25 },
    ]

    const instructions = [
      {
        campo: 'Fecha',
        descripcion: 'Fecha de la venta',
        requerido: 'Si',
        formato: 'dd/mm/yyyy',
      },
      {
        campo: 'Cliente',
        descripcion: 'Nombre exacto del cliente (debe existir en el sistema)',
        requerido: 'Si',
        formato: 'Texto',
      },
      {
        campo: 'Forma_Pago',
        descripcion: 'Forma de pago (debe existir en el sistema)',
        requerido: 'Si',
        formato: 'Texto (ej: Efectivo)',
      },
      {
        campo: 'Codigo',
        descripcion: 'Codigo del producto',
        requerido: 'Si*',
        formato: 'Texto (ej: PROD001)',
      },
      {
        campo: 'Producto',
        descripcion: 'Nombre del producto (alternativa al codigo)',
        requerido: 'Si*',
        formato: 'Texto',
      },
      {
        campo: 'Unidades',
        descripcion: 'Cantidad de unidades vendidas',
        requerido: 'Si',
        formato: 'Numero (ej: 5)',
      },
      {
        campo: 'Precio_Unitario',
        descripcion: 'Precio de venta por unidad (si no se indica, usa el default)',
        requerido: 'No',
        formato: 'Numero (ej: 250.00)',
      },
      {
        campo: 'Costo_Unitario',
        descripcion: 'Costo por unidad para calcular margen (si no se indica, usa el default)',
        requerido: 'No',
        formato: 'Numero (ej: 150.50)',
      },
      {
        campo: 'Notas',
        descripcion: 'Observaciones adicionales',
        requerido: 'No',
        formato: 'Texto',
      },
    ]

    instructions.forEach((inst) => {
      instructionsSheet.addRow(inst)
    })

    // Estilo de header
    instructionsSheet.getRow(1).font = { bold: true }
    instructionsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    }

    // Nota al pie
    instructionsSheet.addRow({})
    const noteRow = instructionsSheet.addRow({
      campo: '* Codigo o Producto: debe proporcionar al menos uno para identificar el producto.',
    })
    noteRow.font = { italic: true }

    autosizeColumns(worksheet)

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="plantilla_ventas.xlsx"',
      },
    })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Error al generar la plantilla' },
      { status: 500 }
    )
  }
}
