'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface Producto {
  id: number
  codigo: string
  nombre: string
  costoDefault: string | number
  precioDefault: string | number
}

interface Cliente {
  id: number
  nombre: string
}

interface FormaPago {
  id: number
  nombre: string
}

interface VentaData {
  id: number
  fecha: string
  clienteId: number
  formaPagoId: number
  productoId: number
  unidades: string | number
  precioUnitario: string | number
  costoAsignado: string | number
  notas: string | null
}

interface VentaFormProps {
  venta?: VentaData
  productos: Producto[]
  clientes: Cliente[]
  formasPago: FormaPago[]
}

export function VentaForm({ venta, productos, clientes, formasPago }: VentaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [productoId, setProductoId] = useState(venta?.productoId?.toString() || '')
  const [unidades, setUnidades] = useState(venta?.unidades?.toString() || '1')
  const [precioUnitario, setPrecioUnitario] = useState(venta?.precioUnitario?.toString() || '')
  const [costoAsignado, setCostoAsignado] = useState(
    venta
      ? (parseFloat(venta.costoAsignado?.toString() || '0') / parseFloat(venta.unidades?.toString() || '1')).toString()
      : ''
  )

  const isEditing = !!venta

  useEffect(() => {
    if (productoId && !isEditing) {
      const producto = productos.find((p) => p.id === parseInt(productoId))
      if (producto) {
        setPrecioUnitario(producto.precioDefault.toString())
        setCostoAsignado(producto.costoDefault.toString())
      }
    }
  }, [productoId, productos, isEditing])

  const ventaTotal = parseFloat(unidades || '0') * parseFloat(precioUnitario || '0')
  const costoTotal = parseFloat(unidades || '0') * parseFloat(costoAsignado || '0')
  const ganancia = ventaTotal - costoTotal
  const margen = ventaTotal > 0 ? (ganancia / ventaTotal) * 100 : 0

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      fecha: formData.get('fecha') as string,
      clienteId: parseInt(formData.get('clienteId') as string),
      formaPagoId: parseInt(formData.get('formaPagoId') as string),
      productoId: parseInt(formData.get('productoId') as string),
      unidades: parseFloat(formData.get('unidades') as string),
      precioUnitario: parseFloat(formData.get('precioUnitario') as string),
      costoAsignado: parseFloat(formData.get('costoAsignado') as string),
      notas: formData.get('notas') as string,
    }

    try {
      const url = isEditing ? `/api/ventas/${venta.id}` : '/api/ventas'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Error al guardar')
      }

      router.push('/ventas')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const fechaDefault = venta?.fecha
    ? new Date(venta.fecha).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Venta' : 'Nueva Venta'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha"
              name="fecha"
              type="date"
              defaultValue={fechaDefault}
              required
            />

            <Select
              label="Forma de Pago"
              name="formaPagoId"
              defaultValue={venta?.formaPagoId?.toString() || ''}
              options={formasPago.map((fp) => ({
                value: fp.id,
                label: fp.nombre,
              }))}
              placeholder="Seleccione forma de pago"
              required
            />
          </div>

          <Select
            label="Cliente"
            name="clienteId"
            defaultValue={venta?.clienteId?.toString() || ''}
            options={clientes.map((c) => ({
              value: c.id,
              label: c.nombre,
            }))}
            placeholder="Seleccione un cliente"
            required
          />

          <Select
            label="Producto"
            name="productoId"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            options={productos.map((p) => ({
              value: p.id,
              label: `${p.codigo} - ${p.nombre}`,
            }))}
            placeholder="Seleccione un producto"
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Unidades"
              name="unidades"
              type="number"
              step="0.01"
              min="0.01"
              value={unidades}
              onChange={(e) => setUnidades(e.target.value)}
              required
            />

            <Input
              label="Precio Unitario"
              name="precioUnitario"
              type="number"
              step="0.01"
              min="0"
              value={precioUnitario}
              onChange={(e) => setPrecioUnitario(e.target.value)}
              required
            />

            <Input
              label="Costo Asignado"
              name="costoAsignado"
              type="number"
              step="0.01"
              min="0"
              value={costoAsignado}
              onChange={(e) => setCostoAsignado(e.target.value)}
              required
            />
          </div>

          <div className="rounded-lg bg-dark-800 p-4 space-y-2">
            <div className="flex justify-between text-dark-200">
              <span>Venta Total:</span>
              <span className="font-medium text-white">{formatCurrency(ventaTotal)}</span>
            </div>
            <div className="flex justify-between text-dark-200">
              <span>Costo Total:</span>
              <span className="font-medium text-white">{formatCurrency(costoTotal)}</span>
            </div>
            <div className="flex justify-between border-t border-dark-600 pt-2">
              <span className="font-medium text-dark-200">Ganancia:</span>
              <span className={`font-bold ${ganancia >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(ganancia)}
              </span>
            </div>
            <div className="flex justify-between text-dark-200">
              <span>Margen:</span>
              <span className={`font-medium ${margen >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatPercent(margen)}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-dark-200">
              Notas
            </label>
            <textarea
              name="notas"
              defaultValue={venta?.notas || ''}
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Observaciones adicionales..."
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
