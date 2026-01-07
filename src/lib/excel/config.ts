import ExcelJS from 'exceljs'

export const EXCEL_CONFIG = {
  headerStyle: {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FF4472C4' },
    },
    alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
  },
  currencyFormat: '"$"#,##0.00',
  percentFormat: '0.00"%"',
  dateFormat: 'dd/mm/yyyy',
}

export function setupWorksheet(
  worksheet: ExcelJS.Worksheet,
  columns: Partial<ExcelJS.Column>[]
) {
  worksheet.columns = columns

  // Freeze first row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.eachCell((cell) => {
    cell.font = EXCEL_CONFIG.headerStyle.font
    cell.fill = EXCEL_CONFIG.headerStyle.fill
    cell.alignment = EXCEL_CONFIG.headerStyle.alignment
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }
  })
  headerRow.height = 25
}

export function autosizeColumns(worksheet: ExcelJS.Worksheet) {
  worksheet.columns.forEach((column) => {
    if (!column.eachCell) return
    let maxLength = 10
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value?.toString() || ''
      maxLength = Math.max(maxLength, cellValue.length + 2)
    })
    column.width = Math.min(maxLength, 50)
  })
}

export function createWorkbook(): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Sistema de Gestion'
  workbook.created = new Date()
  return workbook
}
