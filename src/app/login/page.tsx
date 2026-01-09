'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales incorrectas')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-800 rounded-lg shadow-xl p-8 border border-dark-700">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gold-500">Gestion de Operaciones</h1>
            <p className="text-gray-400 mt-2">Inicia sesion en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

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

            <Button
              type="submit"
              className="w-full bg-gold-600 hover:bg-gold-700 text-dark-900"
              disabled={loading}
            >
              {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              No tienes cuenta?{' '}
              <Link href="/registro" className="text-gold-500 hover:text-gold-400">
                Registrate aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
