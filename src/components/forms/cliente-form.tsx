'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Customer } from '@prisma/client'

interface ClienteFormProps {
  cliente?: Customer
}

export function ClienteForm({ cliente }: ClienteFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!cliente

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      nombre: formData.get('nombre') as string,
      contacto: formData.get('contacto') as string,
      telefono: formData.get('telefono') as string,
      email: formData.get('email') as string,
      activo: formData.get('activo') === 'on',
    }

    try {
      const url = isEditing ? `/api/clientes/${cliente.id}` : '/api/clientes'
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

      router.push('/catalogos/clientes')
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
        <CardTitle>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            label="Nombre"
            name="nombre"
            defaultValue={cliente?.nombre || ''}
            required
            placeholder="Nombre del cliente"
          />

          <Input
            label="Contacto"
            name="contacto"
            defaultValue={cliente?.contacto || ''}
            placeholder="Nombre del contacto"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telefono"
              name="telefono"
              defaultValue={cliente?.telefono || ''}
              placeholder="11-1234-5678"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              defaultValue={cliente?.email || ''}
              placeholder="email@ejemplo.com"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="activo"
              id="activo"
              defaultChecked={cliente?.activo ?? true}
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
