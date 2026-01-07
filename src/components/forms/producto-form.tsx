'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Product } from '@prisma/client'

interface ProductoFormProps {
  producto?: Product
}

export function ProductoForm({ producto }: ProductoFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!producto

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      codigo: formData.get('codigo') as string,
      nombre: formData.get('nombre') as string,
      costoDefault: parseFloat(formData.get('costoDefault') as string) || 0,
      precioDefault: parseFloat(formData.get('precioDefault') as string) || 0,
      activo: formData.get('activo') === 'on',
    }

    try {
      const url = isEditing ? `/api/productos/${producto.id}` : '/api/productos'
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

      router.push('/catalogos/productos')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            label="Codigo"
            name="codigo"
            defaultValue={producto?.codigo || ''}
            required
            placeholder="PROD-001"
          />

          <Input
            label="Nombre"
            name="nombre"
            defaultValue={producto?.nombre || ''}
            required
            placeholder="Nombre del producto"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Costo Default"
              name="costoDefault"
              type="number"
              step="0.01"
              min="0"
              defaultValue={producto?.costoDefault?.toString() || '0'}
              placeholder="0.00"
            />

            <Input
              label="Precio Default"
              name="precioDefault"
              type="number"
              step="0.01"
              min="0"
              defaultValue={producto?.precioDefault?.toString() || '0'}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              defaultChecked={producto?.activo ?? true}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">
              Activo
            </label>
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
