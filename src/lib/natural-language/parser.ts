/**
 * Parser de lenguaje natural para registro rápido de compras y ventas
 *
 * Ejemplos de frases soportadas:
 * - "Compré 10 unidades de PROD001 a Proveedor ABC por $500"
 * - "Vendí 5 cajas de Producto X al cliente Juan por $1000"
 * - "Compra 20 PROD002 proveedor XYZ costo 150"
 * - "Venta 3 productos de prueba cliente Maria precio 2500"
 */

export interface ParsedEntry {
  type: 'compra' | 'venta' | null
  quantity: number | null
  productIdentifier: string | null  // Puede ser código o nombre
  entityName: string | null         // Cliente o proveedor
  unitPrice: number | null
  date: Date
  notes: string | null
  confidence: number                // 0-1, nivel de confianza del parsing
  warnings: string[]                // Advertencias sobre campos no detectados
}

// Palabras clave para identificar tipo de operación
const PURCHASE_KEYWORDS = ['compré', 'compre', 'compra', 'compramos', 'adquirí', 'adquiri']
const SALE_KEYWORDS = ['vendí', 'vendi', 'venta', 'vendemos', 'vendimos']

// Palabras para identificar entidades
const SUPPLIER_KEYWORDS = ['proveedor', 'a proveedor', 'de proveedor', 'del proveedor']
const CUSTOMER_KEYWORDS = ['cliente', 'a cliente', 'al cliente', 'de cliente', 'del cliente']

// Palabras para precio/costo
const PRICE_KEYWORDS = ['por', 'precio', 'a', 'costo', 'valor', '$']

// Palabras para cantidad
const QUANTITY_UNITS = ['unidades', 'unidad', 'piezas', 'pieza', 'cajas', 'caja', 'bultos', 'bulto', 'kilos', 'kilo', 'kg', 'litros', 'litro', 'lt']

/**
 * Normaliza el texto para facilitar el parsing
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[,;]/g, ' ')           // Reemplazar comas y puntos y coma
    .replace(/\s+/g, ' ')            // Normalizar espacios
    .trim()
}

/**
 * Extrae el tipo de operación (compra o venta)
 */
function extractOperationType(text: string): 'compra' | 'venta' | null {
  const normalized = normalizeText(text)

  for (const keyword of PURCHASE_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return 'compra'
    }
  }

  for (const keyword of SALE_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return 'venta'
    }
  }

  return null
}

/**
 * Extrae la cantidad del texto
 */
function extractQuantity(text: string): number | null {
  const normalized = normalizeText(text)

  // Buscar patrones como "10 unidades", "5 cajas", etc.
  for (const unit of QUANTITY_UNITS) {
    const pattern = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${unit}`, 'i')
    const match = normalized.match(pattern)
    if (match) {
      return parseFloat(match[1].replace(',', '.'))
    }
  }

  // Buscar números sueltos después de keywords de operación
  const operationKeywords = [...PURCHASE_KEYWORDS, ...SALE_KEYWORDS]
  for (const keyword of operationKeywords) {
    const pattern = new RegExp(`${keyword}\\s+(\\d+(?:[.,]\\d+)?)`, 'i')
    const match = normalized.match(pattern)
    if (match) {
      return parseFloat(match[1].replace(',', '.'))
    }
  }

  // Buscar el primer número en el texto
  const firstNumber = normalized.match(/(\d+(?:[.,]\d+)?)/)
  if (firstNumber) {
    return parseFloat(firstNumber[1].replace(',', '.'))
  }

  return null
}

/**
 * Extrae el identificador del producto (código o nombre)
 */
function extractProductIdentifier(text: string): string | null {
  const normalized = text.toLowerCase()

  // Buscar códigos de producto (formato alfanumérico típico)
  const codePattern = /\b([A-Z]{2,}[\d]+|[\d]+[A-Z]{2,}|[A-Z]+[-_]?\d+)\b/gi
  const codeMatch = text.match(codePattern)
  if (codeMatch) {
    return codeMatch[0].toUpperCase()
  }

  // Buscar texto entre comillas
  const quotedPattern = /["']([^"']+)["']/
  const quotedMatch = text.match(quotedPattern)
  if (quotedMatch) {
    return quotedMatch[1].trim()
  }

  // Buscar después de "de" (ej: "10 unidades de Producto X")
  const dePattern = /(?:unidades?|piezas?|cajas?)\s+de\s+([^,.\d]+?)(?:\s+(?:a|al|por|proveedor|cliente|precio|costo)|$)/i
  const deMatch = normalized.match(dePattern)
  if (deMatch) {
    return deMatch[1].trim()
  }

  // Buscar después de cantidad
  const afterQuantityPattern = /\d+\s+(?:unidades?\s+(?:de\s+)?)?([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\s+(?:a|al|por|proveedor|cliente)|$)/i
  const afterQuantityMatch = text.match(afterQuantityPattern)
  if (afterQuantityMatch) {
    const product = afterQuantityMatch[1].trim()
    // Filtrar palabras clave que no son productos
    if (!QUANTITY_UNITS.some(u => product.toLowerCase() === u) &&
        !SUPPLIER_KEYWORDS.some(k => product.toLowerCase().includes(k)) &&
        !CUSTOMER_KEYWORDS.some(k => product.toLowerCase().includes(k))) {
      return product
    }
  }

  return null
}

/**
 * Extrae el nombre del cliente o proveedor
 */
function extractEntityName(text: string, type: 'compra' | 'venta' | null): string | null {
  const normalized = text.toLowerCase()

  // Determinar qué keywords buscar según el tipo de operación
  const keywords = type === 'compra' ? SUPPLIER_KEYWORDS :
                   type === 'venta' ? CUSTOMER_KEYWORDS :
                   [...SUPPLIER_KEYWORDS, ...CUSTOMER_KEYWORDS]

  // Buscar después de keywords de entidad
  for (const keyword of keywords) {
    const pattern = new RegExp(`${keyword}\\s+([A-Za-záéíóúñÁÉÍÓÚÑ\\s]+?)(?:\\s+(?:por|precio|costo|\\$)|$)`, 'i')
    const match = normalized.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  // Buscar después de "a" o "al" (ej: "vendí ... al cliente Juan" o "compré ... a Proveedor X")
  const aPattern = /\b(?:a|al)\s+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\s+(?:por|precio|costo|\$)|$)/i
  const aMatch = text.match(aPattern)
  if (aMatch) {
    const entity = aMatch[1].trim()
    // Verificar que no sea una palabra clave
    if (!['proveedor', 'cliente', 'el', 'la', 'los', 'las'].includes(entity.toLowerCase())) {
      return entity
    }
  }

  return null
}

/**
 * Extrae el precio o costo unitario
 */
function extractUnitPrice(text: string): number | null {
  const normalized = normalizeText(text)

  // Buscar patrones con $
  const dollarPattern = /\$\s*([\d.,]+)/
  const dollarMatch = text.match(dollarPattern)
  if (dollarMatch) {
    return parseFloat(dollarMatch[1].replace(/\./g, '').replace(',', '.'))
  }

  // Buscar después de keywords de precio
  for (const keyword of PRICE_KEYWORDS) {
    if (keyword === 'a') continue // 'a' es muy genérico
    const pattern = new RegExp(`${keyword}\\s*(\\d+(?:[.,]\\d+)?)`, 'i')
    const match = normalized.match(pattern)
    if (match) {
      return parseFloat(match[1].replace(',', '.'))
    }
  }

  // Buscar el último número en el texto (probablemente sea el precio)
  const numbers = text.match(/\d+(?:[.,]\d+)?/g)
  if (numbers && numbers.length > 1) {
    return parseFloat(numbers[numbers.length - 1].replace(',', '.'))
  }

  return null
}

/**
 * Calcula el nivel de confianza del parsing
 */
function calculateConfidence(parsed: ParsedEntry): number {
  let score = 0
  let total = 0

  // Tipo de operación (muy importante)
  total += 2
  if (parsed.type) score += 2

  // Cantidad (importante)
  total += 1.5
  if (parsed.quantity && parsed.quantity > 0) score += 1.5

  // Producto (importante)
  total += 1.5
  if (parsed.productIdentifier) score += 1.5

  // Entidad (importante)
  total += 1
  if (parsed.entityName) score += 1

  // Precio (opcional pero útil)
  total += 0.5
  if (parsed.unitPrice && parsed.unitPrice > 0) score += 0.5

  return score / total
}

/**
 * Genera advertencias sobre campos faltantes
 */
function generateWarnings(parsed: ParsedEntry): string[] {
  const warnings: string[] = []

  if (!parsed.type) {
    warnings.push('No se detectó si es compra o venta')
  }
  if (!parsed.quantity) {
    warnings.push('No se detectó la cantidad')
  }
  if (!parsed.productIdentifier) {
    warnings.push('No se detectó el producto')
  }
  if (!parsed.entityName) {
    warnings.push(parsed.type === 'compra' ? 'No se detectó el proveedor' :
                  parsed.type === 'venta' ? 'No se detectó el cliente' :
                  'No se detectó el cliente/proveedor')
  }
  if (!parsed.unitPrice) {
    warnings.push('No se detectó el precio/costo unitario')
  }

  return warnings
}

/**
 * Función principal de parsing
 */
export function parseNaturalLanguageEntry(text: string): ParsedEntry {
  const type = extractOperationType(text)
  const quantity = extractQuantity(text)
  const productIdentifier = extractProductIdentifier(text)
  const entityName = extractEntityName(text, type)
  const unitPrice = extractUnitPrice(text)

  const parsed: ParsedEntry = {
    type,
    quantity,
    productIdentifier,
    entityName,
    unitPrice,
    date: new Date(),
    notes: null,
    confidence: 0,
    warnings: [],
  }

  parsed.confidence = calculateConfidence(parsed)
  parsed.warnings = generateWarnings(parsed)

  return parsed
}

/**
 * Valida si el parsing tiene suficiente información para proceder
 */
export function isValidEntry(parsed: ParsedEntry): boolean {
  return parsed.type !== null &&
         parsed.quantity !== null &&
         parsed.quantity > 0 &&
         parsed.productIdentifier !== null
}

/**
 * Genera un texto de resumen del parsing
 */
export function generateSummary(parsed: ParsedEntry): string {
  if (!parsed.type) {
    return 'No se pudo determinar el tipo de operación'
  }

  const parts: string[] = []

  parts.push(parsed.type === 'compra' ? 'Compra de' : 'Venta de')
  parts.push(`${parsed.quantity || '?'} unidades`)
  parts.push(`de "${parsed.productIdentifier || 'producto no identificado'}"`)

  if (parsed.entityName) {
    parts.push(parsed.type === 'compra' ? `a proveedor "${parsed.entityName}"` : `a cliente "${parsed.entityName}"`)
  }

  if (parsed.unitPrice) {
    parts.push(`por $${parsed.unitPrice.toLocaleString('es-AR')} c/u`)
  }

  return parts.join(' ')
}
