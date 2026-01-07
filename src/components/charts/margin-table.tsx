'use client'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Product {
  id: number
  codigo: string
  nombre: string
  unidades: number
  ventas: number
  costo: number
  ganancia: number
  margen: number
}

interface MarginTableProps {
  data: Product[]
}

export function MarginTable({ data }: MarginTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dark-600 bg-dark-700 p-6">
        <p className="text-dark-300">No hay datos para mostrar</p>
      </div>
    )
  }

  // Ordenar por margen
  const sortedData = [...data].sort((a, b) => b.margen - a.margen).slice(0, 8)

  return (
    <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Margen por Producto</h3>

      <div className="overflow-hidden rounded-lg border border-dark-600">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-600 bg-dark-800">
              <th className="px-4 py-3 text-left font-medium text-dark-200">Producto</th>
              <th className="px-4 py-3 text-right font-medium text-dark-200">Ventas</th>
              <th className="px-4 py-3 text-right font-medium text-dark-200">Ganancia</th>
              <th className="px-4 py-3 text-right font-medium text-dark-200">Margen</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((product, index) => (
              <tr
                key={product.id}
                className="border-b border-dark-600 last:border-0 hover:bg-dark-600/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-white">
                      {product.nombre.length > 25 ? product.nombre.slice(0, 25) + '...' : product.nombre}
                    </p>
                    <p className="text-xs text-dark-400">{product.codigo}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-white">
                  {formatCurrency(product.ventas)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(
                    'font-medium',
                    product.ganancia >= 0 ? 'text-success' : 'text-danger'
                  )}>
                    {formatCurrency(product.ganancia)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16">
                      <div className="h-2 rounded-full bg-dark-600 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            product.margen >= 30 ? 'bg-success' :
                            product.margen >= 15 ? 'bg-gold-400' :
                            'bg-danger'
                          )}
                          style={{ width: `${Math.min(100, Math.max(0, product.margen))}%` }}
                        />
                      </div>
                    </div>
                    <span className={cn(
                      'font-medium min-w-[45px] text-right',
                      product.margen >= 30 ? 'text-success' :
                      product.margen >= 15 ? 'text-gold-400' :
                      'text-danger'
                    )}>
                      {product.margen.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
