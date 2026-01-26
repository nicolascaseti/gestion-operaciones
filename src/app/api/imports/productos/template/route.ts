import { NextResponse } from 'next/server'
import { createWorkbook, setupWorksheet, autosizeColumns } from '@/lib/excel/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const workbook = createWorkbook()
    const worksheet = workbook.addWorksheet('Productos')

    setupWorksheet(worksheet, [
      { header: 'Codigo', key: 'codigo', width: 15 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Descripcion', key: 'descripcion', width: 40 },
      { header: 'Costo_Default', key: 'costo_default', width: 15 },
      { header: 'Precio_Default', key: 'precio_default', width: 15 },
      { header: 'Stock_Inicial', key: 'stock_inicial', width: 15 },
      { header: 'Stock_Minimo', key: 'stock_minimo', width: 15 },
      { header: 'Activo', key: 'activo', width: 10 },
    ])

    // Agregar fila de ejemplo
    const exampleRow = worksheet.addRow({
      codigo: 'PROD001',
      nombre: 'Producto de Ejemplo',
      categoria: 'General',
      descripcion: 'Descripcion del producto',
      costo_default: 100,
      precio_default: 150,
      stock_inicial: 50,
      stock_minimo: 10,
      activo: 'Si',
    })
    exampleRow.font = { italic: true, color: { argb: 'FF888888' } }

    // Agregar instrucciones
    const instructionsSheet = workbook.addWorksheet('Instrucciones')
    instructionsSheet.columns = [
      { header: 'Campo', key: 'campo', width: 20 },
      { header: 'Descripcion', key: 'descripcion', width: 50 },
      { header: 'Requerido', key: 'requerido', width: 12 },
      { header: 'Formato', key: 'formato', width: 30 },
    ]

    const instructions = [
      {
        campo: 'Codigo',
        descripcion: 'Codigo unico del producto',
        requerido: 'Si',
        formato: 'Texto (ej: PROD001)',
      },
      {
        campo: 'Nombre',
        descripcion: 'Nombre del producto',
        requerido: 'Si',
        formato: 'Texto',
      },
      {
        campo: 'Categoria',
        descripcion: 'Categoria o grupo del producto',
        requerido: 'No',
        formato: 'Texto',
      },
      {
        campo: 'Descripcion',
        descripcion: 'Descripcion detallada del producto',
        requerido: 'No',
        formato: 'Texto',
      },
      {
        campo: 'Costo_Default',
        descripcion: 'Costo por defecto del producto',
        requerido: 'No',
        formato: 'Numero (ej: 100.50)',
      },
      {
        campo: 'Precio_Default',
        descripcion: 'Precio de venta por defecto',
        requerido: 'No',
        formato: 'Numero (ej: 150.00)',
      },
      {
        campo: 'Stock_Inicial',
        descripcion: 'Cantidad inicial en inventario',
        requerido: 'No',
        formato: 'Numero (ej: 50)',
      },
      {
        campo: 'Stock_Minimo',
        descripcion: 'Cantidad minima para alertas de stock',
        requerido: 'No',
        formato: 'Numero (ej: 10)',
      },
      {
        campo: 'Activo',
        descripcion: 'Estado del producto (Si/No)',
        requerido: 'No',
        formato: 'Si/No (default: Si)',
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

    // Notas adicionales
    instructionsSheet.addRow({})
    const noteRow1 = instructionsSheet.addRow({
      campo: 'NOTA: Si el codigo ya existe, el producto sera actualizado con los nuevos datos.',
    })
    noteRow1.font = { italic: true }

    const noteRow2 = instructionsSheet.addRow({
      campo: 'Los valores numericos usan punto (.) como separador decimal.',
    })
    noteRow2.font = { italic: true }

    autosizeColumns(worksheet)

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="plantilla_productos.xlsx"',
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
