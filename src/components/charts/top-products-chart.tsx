'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

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

interface TopProductsChartProps {
  data: Product[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const product = payload[0].payload
    return (
      <div className="rounded-lg border border-dark-500 bg-dark-800 p-3 shadow-dark-lg">
        <p className="mb-2 text-sm font-medium text-white">{product.nombre}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-dark-300">Ventas:</span>
            <span className="font-medium text-gold-400">{formatCurrency(product.ventas)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-dark-300">Unidades:</span>
            <span className="text-white">{product.unidades.toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-dark-300">Ganancia:</span>
            <span className="font-medium text-success">{formatCurrency(product.ganancia)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-dark-300">Margen:</span>
            <span className="text-white">{product.margen.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const [viewMode, setViewMode] = useState<'ventas' | 'unidades'>('ventas')

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dark-600 bg-dark-700 p-6">
        <p className="text-dark-300">No hay datos para mostrar</p>
      </div>
    )
  }

  const chartData = data
    .map(p => ({
      ...p,
      displayName: p.nombre.length > 20 ? p.nombre.slice(0, 20) + '...' : p.nombre,
      value: viewMode === 'ventas' ? p.ventas : p.unidades
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const maxValue = Math.max(...chartData.map(d => d.value))

  return (
    <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Productos Mas Vendidos</h3>
        <div className="flex rounded-lg bg-dark-600 p-1">
          <button
            onClick={() => setViewMode('ventas')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              viewMode === 'ventas'
                ? 'bg-gold-400 text-dark-900'
                : 'text-dark-200 hover:text-white'
            )}
          >
            Por $
          </button>
          <button
            onClick={() => setViewMode('unidades')}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              viewMode === 'unidades'
                ? 'bg-gold-400 text-dark-900'
                : 'text-dark-200 hover:text-white'
            )}
          >
            Por Unidades
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            stroke="#737373"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#404040' }}
            tickFormatter={(value) =>
              viewMode === 'ventas'
                ? `$${(value / 1000).toFixed(0)}k`
                : value.toLocaleString('es-AR')
            }
          />
          <YAxis
            type="category"
            dataKey="displayName"
            stroke="#737373"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#404040' }}
            width={95}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`rgba(212, 168, 83, ${1 - (index * 0.1)})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
