'use client'

import { useEffect, useState } from 'react'
import { InventoryTable } from '@/components/inventario/inventory-table'
import { RefreshCw, Download, Package, AlertTriangle, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface InventoryItem {
  id: number
  codigo: string
  nombre: string
  categoria: string | null
  imagen: string | null
  stockInicial: number
  entradas: number
  salidas: number
  stockActual: number
  costoUnitario: number
  valorTotal: number
  precioVenta: number
  margen: number
  estado: 'agotado' | 'bajo' | 'normal'
}

export default function InventarioPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/inventario')
      if (!response.ok) throw new Error('Error al cargar inventario')
      const data = await response.json()
      setInventory(data.inventory)
      setCategories(data.categories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleExport = () => {
    window.open('/api/exports/inventario.xlsx', '_blank')
  }

  // Calcular estadisticas
  const stats = {
    totalProductos: inventory.length,
    productosAgotados: inventory.filter((i) => i.estado === 'agotado').length,
    productosBajos: inventory.filter((i) => i.estado === 'bajo').length,
    valorTotal: inventory.reduce((sum, i) => sum + i.valorTotal, 0),
    unidadesTotal: inventory.reduce((sum, i) => sum + i.stockActual, 0),
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-danger">{error}</p>
          <button
            onClick={fetchInventory}
            className="mt-4 flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-dark-900 hover:bg-gold-500"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-dark-300">
            Control de stock y movimientos de productos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-dark-500 bg-dark-700 text-dark-200 hover:bg-dark-600 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 font-medium text-dark-900 hover:bg-gold-500 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-dark-600 bg-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/10">
              <Package className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalProductos}</p>
              <p className="text-xs text-dark-400">Productos en catalogo</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dark-600 bg-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10">
              <AlertTriangle className="h-5 w-5 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.productosAgotados + stats.productosBajos}
              </p>
              <p className="text-xs text-dark-400">
                {stats.productosAgotados} agotados, {stats.productosBajos} bajos
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dark-600 bg-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Package className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.unidadesTotal.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-dark-400">Unidades en stock</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dark-600 bg-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/10">
              <DollarSign className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gold-400">
                {formatCurrency(stats.valorTotal)}
              </p>
              <p className="text-xs text-dark-400">Valor total en stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de inventario */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-12 rounded-lg bg-dark-700"></div>
          <div className="h-96 rounded-xl bg-dark-700"></div>
        </div>
      ) : (
        <InventoryTable items={inventory} categories={categories} />
      )}
    </div>
  )
}
