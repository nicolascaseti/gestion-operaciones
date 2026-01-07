'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Package,
  ArrowLeft,
  Save,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { ImageUpload } from './image-upload'
import { MovementHistory } from './movement-history'

interface Movement {
  id: number
  fecha: Date
  tipo: 'entrada' | 'salida'
  cantidad: number
  referencia: string
  costoUnitario?: number
  precioUnitario?: number
}

interface ProductDetailProps {
  product: {
    id: number
    codigo: string
    nombre: string
    categoria: string | null
    descripcion: string | null
    imagen: string | null
    stockInicial: number
    entradas: number
    salidas: number
    stockActual: number
    costoUnitario: number
    valorTotal: number
    precioVenta: number
    margen: number
    stockMinimo: number
    estado: 'agotado' | 'bajo' | 'normal'
    movimientos: Movement[]
  }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    stockInicial: product.stockInicial,
    stockMinimo: product.stockMinimo,
    precioVenta: product.precioVenta,
    descripcion: product.descripcion || '',
    imagen: product.imagen || '',
    categoria: product.categoria || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/inventario/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Error al guardar')

      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar los cambios')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (estado: string) => {
    const config = {
      agotado: {
        icon: XCircle,
        label: 'Agotado',
        className: 'bg-danger/10 text-danger border-danger/20',
      },
      bajo: {
        icon: AlertTriangle,
        label: 'Stock bajo',
        className: 'bg-warning/10 text-warning border-warning/20',
      },
      normal: {
        icon: CheckCircle,
        label: 'Normal',
        className: 'bg-success/10 text-success border-success/20',
      },
    }
    const { icon: Icon, label, className } = config[estado as keyof typeof config]
    return (
      <span
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium',
          className
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inventario
        </button>
        {getStatusBadge(product.estado)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda: Imagen y descripcion */}
        <div className="space-y-6">
          <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Imagen del producto
            </h3>
            <ImageUpload
              currentImage={formData.imagen}
              onImageChange={(image) =>
                setFormData({ ...formData, imagen: image })
              }
            />
          </div>

          <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Descripcion
            </h3>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Descripcion del producto..."
              rows={4}
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-white placeholder-dark-400 focus:border-gold-400 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Columna central: Informacion y formulario */}
        <div className="space-y-6">
          {/* Info del producto */}
          <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gold-400/10">
                {formData.imagen ? (
                  <img
                    src={formData.imagen}
                    alt={product.nombre}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <Package className="h-8 w-8 text-gold-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{product.nombre}</h2>
                <p className="text-dark-400">Codigo: {product.codigo}</p>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-dark-800 p-4">
                <p className="text-xs text-dark-400 mb-1">Stock Actual</p>
                <p className="text-2xl font-bold text-white">
                  {product.stockActual}
                </p>
              </div>
              <div className="rounded-lg bg-dark-800 p-4">
                <p className="text-xs text-dark-400 mb-1">Valor en Stock</p>
                <p className="text-2xl font-bold text-gold-400">
                  {formatCurrency(product.valorTotal)}
                </p>
              </div>
              <div className="rounded-lg bg-dark-800 p-4">
                <p className="text-xs text-dark-400 mb-1">Costo Unitario</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(product.costoUnitario)}
                </p>
              </div>
              <div className="rounded-lg bg-dark-800 p-4">
                <p className="text-xs text-dark-400 mb-1">Margen</p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    product.margen >= 30
                      ? 'text-success'
                      : product.margen >= 15
                      ? 'text-warning'
                      : 'text-danger'
                  )}
                >
                  {product.margen.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Resumen de movimientos */}
            <div className="mt-4 flex items-center justify-between rounded-lg bg-dark-800 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-dark-400">Entradas</p>
                  <p className="font-semibold text-success">+{product.entradas}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10">
                  <TrendingDown className="h-4 w-4 text-danger" />
                </div>
                <div>
                  <p className="text-xs text-dark-400">Salidas</p>
                  <p className="font-semibold text-danger">-{product.salidas}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de configuracion */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-dark-600 bg-dark-700 p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">
              Configuracion
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-300">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  placeholder="Ej: Electronica, Ropa, etc."
                  className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-white placeholder-dark-400 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-dark-300">
                  Stock Inicial
                </label>
                <input
                  type="number"
                  value={formData.stockInicial}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockInicial: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="1"
                  className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-white placeholder-dark-400 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-dark-300">
                  Stock Minimo (alerta)
                </label>
                <input
                  type="number"
                  value={formData.stockMinimo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockMinimo: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="1"
                  className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-white placeholder-dark-400 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-dark-300">
                  Precio de Venta
                </label>
                <input
                  type="number"
                  value={formData.precioVenta}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      precioVenta: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-white placeholder-dark-400 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 font-semibold text-dark-900 hover:bg-gold-500 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>

        {/* Columna derecha: Historial de movimientos */}
        <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Historial de Movimientos
          </h3>
          <MovementHistory movements={product.movimientos} />
        </div>
      </div>
    </div>
  )
}
