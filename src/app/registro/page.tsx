'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegistroPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      tenantName: formData.get('tenantName') as string,
    }

    if (data.password !== data.confirmPassword) {
      setError('Las contrasenas no coinciden')
      setLoading(false)
      return
    }

    if (data.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Error al crear la cuenta')
      } else {
        router.push('/login?registered=true')
      }
    } catch {
      setError('Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-800 rounded-lg shadow-xl p-8 border border-dark-700">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gold-500">Crear Cuenta</h1>
            <p className="text-gray-400 mt-2">Registra tu empresa</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tenantName">Nombre de la Empresa</Label>
              <Input
                id="tenantName"
                name="tenantName"
                type="text"
                required
                placeholder="Mi Empresa S.A."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tu Nombre</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Juan Perez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="********"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contrasena</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="********"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gold-600 hover:bg-gold-700 text-dark-900"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Ya tienes cuenta?{' '}
              <Link href="/login" className="text-gold-500 hover:text-gold-400">
                Inicia sesion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
