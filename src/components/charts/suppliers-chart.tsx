'use client'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Truck, AlertTriangle } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'

interface Supplier {
  id: number
  nombre: string
  totalComprado: number
  porcentajeTotal: number
}

interface SuppliersChartProps {
  data: Supplier[]
}

const COLORS = ['#d4a853', '#c9973b', '#b8860b', '#92691a', '#78551c', '#65461d']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const supplier = payload[0].payload
    return (
      <div className="rounded-lg border border-dark-500 bg-dark-800 p-3 shadow-dark-lg">
        <p className="mb-1 text-sm font-medium text-white">{supplier.nombre}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-dark-300">Total:</span>
            <span className="font-medium text-gold-400">{formatCurrency(supplier.totalComprado)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-dark-300">% del total:</span>
            <span className="text-white">{supplier.porcentajeTotal.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function SuppliersChart({ data }: SuppliersChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center rounded-xl border border-dark-600 bg-dark-700 p-6">
        <div className="text-center">
          <Truck className="mx-auto h-12 w-12 text-dark-500" />
          <p className="mt-2 text-dark-300">No hay compras en este periodo</p>
        </div>
      </div>
    )
  }

  // Detectar dependencia alta (un proveedor > 50%)
  const hasHighDependency = data.some(s => s.porcentajeTotal > 50)

  return (
    <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-gold-400" />
          <h3 className="text-lg font-semibold text-white">Dependencia de Proveedores</h3>
        </div>
        {hasHighDependency && (
          <div className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            Alta concentracion
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="totalComprado"
                nameKey="nombre"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* List */}
        <div className="space-y-2">
          {data.slice(0, 5).map((supplier, index) => (
            <div key={supplier.id} className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{supplier.nombre}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {formatCurrency(supplier.totalComprado)}
                </p>
                <p className={cn(
                  'text-xs',
                  supplier.porcentajeTotal > 50 ? 'text-warning' : 'text-dark-300'
                )}>
                  {supplier.porcentajeTotal.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
