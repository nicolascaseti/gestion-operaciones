'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface Producto {
  id: number
  codigo: string
  nombre: string
  costoDefault: string | number
}

interface Proveedor {
  id: number
  nombre: string
}

interface CompraData {
  id: number
  fecha: string
  proveedorId: number
  productoId: number
  cantidad: string | number
  costoUnitario: string | number
  notas: string | null
}

interface CompraFormProps {
  compra?: CompraData
  productos: Producto[]
  proveedores: Proveedor[]
}

export function CompraForm({ compra, productos, proveedores }: CompraFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [productoId, setProductoId] = useState(compra?.productoId?.toString() || '')
  const [cantidad, setCantidad] = useState(compra?.cantidad?.toString() || '1')
  const [costoUnitario, setCostoUnitario] = useState(compra?.costoUnitario?.toString() || '')

  const isEditing = !!compra

  useEffect(() => {
    if (productoId && !isEditing) {
      const producto = productos.find((p) => p.id === parseInt(productoId))
      if (producto) {
        setCostoUnitario(producto.costoDefault.toString())
      }
    }
  }, [productoId, productos, isEditing])

  const costoTotal = parseFloat(cantidad || '0') * parseFloat(costoUnitario || '0')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      fecha: formData.get('fecha') as string,
      proveedorId: parseInt(formData.get('proveedorId') as string),
      productoId: parseInt(formData.get('productoId') as string),
      cantidad: parseFloat(formData.get('cantidad') as string),
      costoUnitario: parseFloat(formData.get('costoUnitario') as string),
      notas: formData.get('notas') as string,
    }

    try {
      const url = isEditing ? `/api/compras/${compra.id}` : '/api/compras'
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

      router.push('/compras')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const fechaDefault = compra?.fecha
    ? new Date(compra.fecha).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Compra' : 'Nueva Compra'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <Input
            label="Fecha"
            name="fecha"
            type="date"
            defaultValue={fechaDefault}
            required
          />

          <Select
            label="Proveedor"
            name="proveedorId"
            defaultValue={compra?.proveedorId?.toString() || ''}
            options={proveedores.map((p) => ({
              value: p.id,
              label: p.nombre,
            }))}
            placeholder="Seleccione un proveedor"
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cantidad"
              name="cantidad"
              type="number"
              step="0.01"
              min="0.01"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />

            <Input
              label="Costo Unitario"
              name="costoUnitario"
              type="number"
              step="0.01"
              min="0"
              value={costoUnitario}
              onChange={(e) => setCostoUnitario(e.target.value)}
              required
            />
          </div>

          <div className="rounded-lg bg-dark-800 p-4">
            <div className="flex justify-between">
              <span className="font-medium text-dark-200">Costo Total:</span>
              <span className="text-lg font-bold text-gold-400">
                {formatCurrency(costoTotal)}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-dark-200">
              Notas
            </label>
            <textarea
              name="notas"
              defaultValue={compra?.notas || ''}
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
