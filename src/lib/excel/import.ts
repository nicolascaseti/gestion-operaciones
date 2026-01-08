import ExcelJS from 'exceljs'

// Parse Excel file to array of objects
export async function parseExcelFile(buffer: Buffer): Promise<Record<string, unknown>[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer)

  const worksheet = workbook.worksheets[0]
  if (!worksheet) {
    throw new Error('El archivo no contiene hojas de trabajo')
  }

  const rows: Record<string, unknown>[] = []
  const headers: string[] = []

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // Primera fila = headers
      row.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.text.trim().toLowerCase()
      })
    } else {
      // Filas de datos
      const rowData: Record<string, unknown> = { _rowNumber: rowNumber }
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber]
        if (header) {
          // Manejar diferentes tipos de valores
          if (cell.type === ExcelJS.ValueType.Date) {
            rowData[header] = cell.value as Date
          } else if (cell.type === ExcelJS.ValueType.Number) {
            rowData[header] = cell.value as number
          } else {
            rowData[header] = cell.text.trim()
          }
        }
      })

      // Solo agregar filas que tengan algun dato
      const hasData = Object.keys(rowData).some(
        (key) => key !== '_rowNumber' && rowData[key] !== ''
      )
      if (hasData) {
        rows.push(rowData)
      }
    }
  })

  return rows
}

export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

export function parseDate(value: unknown): Date | null {
  if (!value) return null

  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string') {
    // Intentar parsear dd/mm/yyyy
    const parts = value.split(/[\/\-]/)
    if (parts.length === 3) {
      const day = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const year = parseInt(parts[2])

      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day)
      }
    }

    // Intentar parseo directo
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  if (typeof value === 'number') {
    // Excel almacena fechas como numeros
    const date = new Date((value - 25569) * 86400 * 1000)
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  return null
}

export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null

  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    // Remover separadores de miles y reemplazar coma decimal
    const cleaned = value
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.-]/g, '')

    const num = parseFloat(cleaned)
    return isNaN(num) ? null : num
  }

  return null
}
