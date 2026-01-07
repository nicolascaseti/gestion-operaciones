'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductDetail } from '@/components/inventario/product-detail'
import { RefreshCw } from 'lucide-react'

interface Movement {
  id: number
  fecha: Date
  tipo: 'entrada' | 'salida'
  cantidad: number
  referencia: string
  costoUnitario?: number
  precioUnitario?: number
}

interface ProductData {
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

export default function InventarioDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<ProductData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/inventario/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado')
        }
        throw new Error('Error al cargar el producto')
      }
      const data = await response.json()
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-dark-700"></div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-xl bg-dark-700"></div>
          <div className="h-80 rounded-xl bg-dark-700"></div>
          <div className="h-80 rounded-xl bg-dark-700"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-danger">{error}</p>
          <button
            onClick={fetchProduct}
            className="mt-4 flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-dark-900 hover:bg-gold-500"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return <ProductDetail product={product} />
}
