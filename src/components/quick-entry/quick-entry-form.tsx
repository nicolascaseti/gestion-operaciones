'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MessageSquare,
  ShoppingCart,
  DollarSign,
  Package,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  HelpCircle,
  Plus,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ParsedResult {
  parsed: {
    type: 'compra' | 'venta' | null
    quantity: number | null
    productIdentifier: string | null
    entityName: string | null
    unitPrice: number | null
    confidence: number
    warnings: string[]
  }
  summary: string
  validation: {
    isValid: boolean
    product: {
      found: boolean
      id: number | null
      codigo: string | null
      nombre: string | null
      costoDefault: number | null
      precioDefault: number | null
    } | null
    entity: {
      found: boolean
      id: number | null
      nombre: string | null
      willCreate: boolean
    } | null
    paymentMethod: {
      id: number | null
      nombre: string | null
    } | null
    errors: string[]
  }
}

interface SubmitResult {
  success: boolean
  type: 'compra' | 'venta'
  data: Record<string, unknown>
}

export function QuickEntryForm() {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [parseResult, setParseResult] = useState<ParsedResult | null>(null)
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreateProduct, setShowCreateProduct] = useState(false)
  const [customPrice, setCustomPrice] = useState<string>('')

  const handleParse = useCallback(async () => {
    if (!text.trim()) return

    setIsLoading(true)
    setError(null)
    setParseResult(null)
    setSubmitResult(null)
    setShowCreateProduct(false)

    try {
      const response = await fetch('/api/quick-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, action: 'parse' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al analizar')
      }

      setParseResult(data)

      // Si el producto no se encontró, mostrar opción de crear
      if (data.validation.product && !data.validation.product.found) {
        setShowCreateProduct(true)
      }

      // Establecer precio sugerido
      if (data.validation.product?.found) {
        const suggestedPrice = data.parsed.type === 'compra'
          ? data.validation.product.costoDefault
          : data.validation.product.precioDefault
        if (suggestedPrice) {
          setCustomPrice(suggestedPrice.toString())
        }
      } else if (data.parsed.unitPrice) {
        setCustomPrice(data.parsed.unitPrice.toString())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [text])

  const handleSubmit = useCallback(async (createProduct = false) => {
    if (!parseResult) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/quick-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          action: 'submit',
          productId: parseResult.validation.product?.id,
          entityId: parseResult.validation.entity?.id,
          createEntity: parseResult.validation.entity?.willCreate,
          createProduct,
          paymentMethodId: parseResult.validation.paymentMethod?.id,
          unitPrice: customPrice ? parseFloat(customPrice) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar')
      }

      setSubmitResult(data)
      setText('')
      setParseResult(null)
      setCustomPrice('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [parseResult, text, customPrice])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (parseResult && parseResult.validation.isValid) {
        handleSubmit()
      } else {
        handleParse()
      }
    }
  }

  const clearAll = () => {
    setText('')
    setParseResult(null)
    setSubmitResult(null)
    setError(null)
    setShowCreateProduct(false)
    setCustomPrice('')
  }

  return (
    <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/10">
          <MessageSquare className="h-5 w-5 text-gold-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Registro Rapido</h3>
          <p className="text-sm text-dark-300">
            Escribe una compra o venta en lenguaje natural
          </p>
        </div>
      </div>

      {/* Ejemplos */}
      <div className="mb-4 rounded-lg bg-dark-800 p-3">
        <div className="flex items-start gap-2">
          <HelpCircle className="h-4 w-4 text-dark-400 mt-0.5 shrink-0" />
          <div className="text-xs text-dark-400">
            <p className="font-medium mb-1">Ejemplos:</p>
            <ul className="space-y-1">
              <li>"Compre 10 unidades de PROD001 a Proveedor ABC por $500"</li>
              <li>"Vendi 5 cajas de producto XYZ al cliente Juan por $1500"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="relative mb-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe aqui tu compra o venta..."
          className="pr-24"
          disabled={isLoading}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button
            size="sm"
            onClick={handleParse}
            disabled={!text.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Analizar'
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-danger/10 border border-danger/20 p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Resultado del submit */}
      {submitResult && (
        <div className="mb-4 rounded-lg bg-success/10 border border-success/20 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-success shrink-0" />
            <div>
              <p className="font-medium text-success mb-1">
                {submitResult.type === 'compra' ? 'Compra' : 'Venta'} registrada exitosamente
              </p>
              <p className="text-sm text-success/80">
                La operacion ha sido guardada correctamente.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="mt-2 text-success hover:text-success"
              >
                Registrar otra operacion
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Vista previa del parsing */}
      {parseResult && !submitResult && (
        <div className="space-y-4">
          {/* Resumen */}
          <div className="rounded-lg bg-dark-800 p-4">
            <p className="text-sm text-dark-200 mb-3">{parseResult.summary}</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de operación */}
              <div className="flex items-center gap-2">
                {parseResult.parsed.type === 'compra' ? (
                  <ShoppingCart className="h-4 w-4 text-gold-400" />
                ) : parseResult.parsed.type === 'venta' ? (
                  <DollarSign className="h-4 w-4 text-success" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-danger" />
                )}
                <span className="text-sm text-white">
                  {parseResult.parsed.type === 'compra'
                    ? 'Compra'
                    : parseResult.parsed.type === 'venta'
                    ? 'Venta'
                    : 'No detectado'}
                </span>
              </div>

              {/* Cantidad */}
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-dark-400" />
                <span className="text-sm text-white">
                  {parseResult.parsed.quantity || '?'} unidades
                </span>
              </div>

              {/* Producto */}
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-dark-400" />
                <span className={`text-sm ${parseResult.validation.product?.found ? 'text-white' : 'text-danger'}`}>
                  {parseResult.validation.product?.found
                    ? `${parseResult.validation.product.codigo} - ${parseResult.validation.product.nombre}`
                    : parseResult.parsed.productIdentifier || 'No detectado'}
                </span>
                {parseResult.validation.product?.found && (
                  <CheckCircle className="h-3 w-3 text-success" />
                )}
              </div>

              {/* Cliente/Proveedor */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-dark-400" />
                <span className="text-sm text-white">
                  {parseResult.validation.entity?.nombre || parseResult.parsed.entityName || 'No detectado'}
                </span>
                {parseResult.validation.entity?.found ? (
                  <CheckCircle className="h-3 w-3 text-success" />
                ) : parseResult.validation.entity?.willCreate ? (
                  <span className="text-xs text-gold-400">(se creara)</span>
                ) : null}
              </div>
            </div>

            {/* Precio editable */}
            <div className="mt-4 pt-4 border-t border-dark-600">
              <div className="flex items-center gap-3">
                <label className="text-sm text-dark-300">Precio unitario:</label>
                <div className="flex items-center gap-2">
                  <span className="text-dark-400">$</span>
                  <Input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-32"
                    placeholder="0.00"
                  />
                </div>
                {parseResult.parsed.quantity && customPrice && (
                  <span className="text-sm text-dark-400">
                    Total: {formatCurrency(parseResult.parsed.quantity * parseFloat(customPrice || '0'))}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Advertencias */}
          {parseResult.parsed.warnings.length > 0 && (
            <div className="rounded-lg bg-gold-400/10 border border-gold-400/20 p-3">
              <p className="text-sm text-gold-400 font-medium mb-1">Advertencias:</p>
              <ul className="text-xs text-gold-400/80 space-y-1">
                {parseResult.parsed.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Errores */}
          {parseResult.validation.errors.length > 0 && (
            <div className="rounded-lg bg-danger/10 border border-danger/20 p-3">
              <p className="text-sm text-danger font-medium mb-1">Errores:</p>
              <ul className="text-xs text-danger/80 space-y-1">
                {parseResult.validation.errors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Opción de crear producto */}
          {showCreateProduct && parseResult.parsed.productIdentifier && (
            <div className="rounded-lg bg-dark-800 border border-dark-600 p-4">
              <div className="flex items-start gap-3">
                <Plus className="h-5 w-5 text-gold-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-1">
                    Producto no encontrado
                  </p>
                  <p className="text-xs text-dark-300 mb-3">
                    ¿Deseas crear el producto "{parseResult.parsed.productIdentifier}"?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSubmit(true)}
                      disabled={isLoading}
                    >
                      Crear y registrar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowCreateProduct(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          {parseResult.validation.isValid && (
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={clearAll}>
                Cancelar
              </Button>
              <Button onClick={() => handleSubmit()} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  `Confirmar ${parseResult.parsed.type}`
                )}
              </Button>
            </div>
          )}

          {/* Confianza */}
          <div className="text-center">
            <span className="text-xs text-dark-400">
              Confianza del analisis: {Math.round(parseResult.parsed.confidence * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
