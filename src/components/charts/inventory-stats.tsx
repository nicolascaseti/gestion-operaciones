'use client'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Package, RotateCcw, Clock, AlertCircle } from 'lucide-react'

interface InventoryStatsProps {
  stockUnidades: number
  stockValorizado: number
  productosSinMovimiento: number
  rotacion: number
  diasInventario: number
}

export function InventoryStats({
  stockUnidades,
  stockValorizado,
  productosSinMovimiento,
  rotacion,
  diasInventario
}: InventoryStatsProps) {
  const stats = [
    {
      label: 'Stock Actual',
      value: stockUnidades.toLocaleString('es-AR'),
      subValue: 'unidades',
      icon: Package,
      color: 'gold'
    },
    {
      label: 'Valorizado',
      value: formatCurrency(stockValorizado),
      subValue: 'a costo',
      icon: Package,
      color: 'gold'
    },
    {
      label: 'Rotacion',
      value: rotacion.toFixed(2),
      subValue: 'veces/año',
      icon: RotateCcw,
      color: rotacion >= 4 ? 'success' : rotacion >= 2 ? 'gold' : 'danger'
    },
    {
      label: 'Dias de Stock',
      value: diasInventario.toString(),
      subValue: 'dias promedio',
      icon: Clock,
      color: diasInventario <= 90 ? 'success' : diasInventario <= 180 ? 'gold' : 'danger'
    },
    {
      label: 'Sin Movimiento',
      value: productosSinMovimiento.toString(),
      subValue: 'productos (30d)',
      icon: AlertCircle,
      color: productosSinMovimiento === 0 ? 'success' : productosSinMovimiento <= 3 ? 'gold' : 'danger'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'success':
        return 'bg-success/10 text-success'
      case 'danger':
        return 'bg-danger/10 text-danger'
      default:
        return 'bg-gold-400/10 text-gold-400'
    }
  }

  return (
    <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Inventario</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="rounded-lg border border-dark-600 bg-dark-800/50 p-4 text-center"
            >
              <div className={cn(
                'mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg',
                getColorClasses(stat.color)
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-dark-300">{stat.subValue}</p>
              <p className="mt-1 text-xs font-medium text-dark-400">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Interpretación */}
      <div className="mt-4 rounded-lg bg-dark-800/50 p-3">
        <p className="text-xs text-dark-300">
          <span className="text-gold-400">Interpretacion:</span>{' '}
          {rotacion >= 4
            ? 'Excelente rotacion de inventario. El stock se renueva frecuentemente.'
            : rotacion >= 2
            ? 'Rotacion aceptable. Considere optimizar productos de baja rotacion.'
            : 'Rotacion baja. Revisar productos estancados y ajustar compras.'}
        </p>
      </div>
    </div>
  )
}
