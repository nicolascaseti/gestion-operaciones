'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Search,
  Filter,
  Package,
  ArrowUpDown,
  Eye,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from 'lucide-react'

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

interface InventoryTableProps {
  items: InventoryItem[]
  categories: string[]
}

type SortField = 'nombre' | 'stockActual' | 'valorTotal' | 'margen'
type SortOrder = 'asc' | 'desc'

export function InventoryTable({ items, categories }: InventoryTableProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>('nombre')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const filteredItems = useMemo(() => {
    let result = [...items]

    // Busqueda
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchLower) ||
          item.codigo.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por categoria
    if (categoryFilter) {
      result = result.filter((item) => item.categoria === categoryFilter)
    }

    // Filtro por estado
    if (statusFilter) {
      result = result.filter((item) => item.estado === statusFilter)
    }

    // Ordenamiento
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'nombre':
          comparison = a.nombre.localeCompare(b.nombre)
          break
        case 'stockActual':
          comparison = a.stockActual - b.stockActual
          break
        case 'valorTotal':
          comparison = a.valorTotal - b.valorTotal
          break
        case 'margen':
          comparison = a.margen - b.margen
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [items, search, categoryFilter, statusFilter, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const totals = useMemo(() => {
    return {
      stockActual: filteredItems.reduce((sum, i) => sum + i.stockActual, 0),
      valorTotal: filteredItems.reduce((sum, i) => sum + i.valorTotal, 0),
    }
  }, [filteredItems])

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'agotado':
        return <XCircle className="h-4 w-4 text-danger" />
      case 'bajo':
        return <AlertTriangle className="h-4 w-4 text-warning" />
      default:
        return <CheckCircle className="h-4 w-4 text-success" />
    }
  }

  const getStatusBadge = (estado: string) => {
    const styles = {
      agotado: 'bg-danger/10 text-danger border-danger/20',
      bajo: 'bg-warning/10 text-warning border-warning/20',
      normal: 'bg-success/10 text-success border-success/20',
    }
    const labels = {
      agotado: 'Agotado',
      bajo: 'Stock bajo',
      normal: 'Normal',
    }
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
          styles[estado as keyof typeof styles]
        )}
      >
        {getStatusIcon(estado)}
        {labels[estado as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o codigo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-dark-600 bg-dark-700 py-2 pl-10 pr-4 text-white placeholder-dark-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-white focus:border-gold-400 focus:outline-none"
          >
            <option value="">Todas las categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-white focus:border-gold-400 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="normal">Normal</option>
            <option value="bajo">Stock bajo</option>
            <option value="agotado">Agotado</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-dark-600 bg-dark-700">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-600 bg-dark-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-dark-300">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-dark-300">
                Categoria
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-dark-300">
                Stock Inicial
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-dark-300">
                Entradas
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-dark-300">
                Salidas
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase text-dark-300 hover:text-white"
                onClick={() => handleSort('stockActual')}
              >
                <span className="inline-flex items-center gap-1">
                  Stock Actual
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-dark-300">
                Costo
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase text-dark-300 hover:text-white"
                onClick={() => handleSort('valorTotal')}
              >
                <span className="inline-flex items-center gap-1">
                  Valor Total
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-dark-300">
                Precio
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase text-dark-300 hover:text-white"
                onClick={() => handleSort('margen')}
              >
                <span className="inline-flex items-center gap-1">
                  Margen
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-dark-300">
                Estado
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-dark-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-dark-400">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-dark-600/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-600 overflow-hidden">
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-dark-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.nombre}</p>
                        <p className="text-xs text-dark-400">{item.codigo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-300">
                    {item.categoria || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-dark-300">
                    {item.stockInicial}
                  </td>
                  <td className="px-4 py-3 text-right text-success">
                    +{item.entradas}
                  </td>
                  <td className="px-4 py-3 text-right text-danger">
                    -{item.salidas}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-white">
                    {item.stockActual}
                  </td>
                  <td className="px-4 py-3 text-right text-dark-300">
                    {formatCurrency(item.costoUnitario)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gold-400">
                    {formatCurrency(item.valorTotal)}
                  </td>
                  <td className="px-4 py-3 text-right text-dark-300">
                    {formatCurrency(item.precioVenta)}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-3 text-right font-medium',
                      item.margen >= 30
                        ? 'text-success'
                        : item.margen >= 15
                        ? 'text-warning'
                        : 'text-danger'
                    )}
                  >
                    {item.margen.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(item.estado)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/inventario/${item.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-dark-600 px-3 py-1.5 text-sm text-white hover:bg-dark-500 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {filteredItems.length > 0 && (
            <tfoot>
              <tr className="border-t border-dark-500 bg-dark-800">
                <td colSpan={5} className="px-4 py-3 font-medium text-white">
                  Totales ({filteredItems.length} productos)
                </td>
                <td className="px-4 py-3 text-right font-bold text-white">
                  {totals.stockActual}
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right font-bold text-gold-400">
                  {formatCurrency(totals.valorTotal)}
                </td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
