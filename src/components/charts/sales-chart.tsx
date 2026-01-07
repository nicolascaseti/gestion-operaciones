'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface SalesChartProps {
  data: Array<{
    date: string
    ventas: number
    costos: number
    ganancia: number
  }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-dark-500 bg-dark-800 p-3 shadow-dark-lg">
        <p className="mb-2 text-sm font-medium text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-dark-200">{entry.name}:</span>
            </div>
            <span className="font-medium text-white">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function SalesChart({ data }: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dark-600 bg-dark-700 p-6">
        <p className="text-dark-300">No hay datos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Ventas en el Tiempo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
          <XAxis
            dataKey="date"
            stroke="#737373"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#404040' }}
          />
          <YAxis
            stroke="#737373"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#404040' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-dark-200">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="ventas"
            name="Ventas"
            stroke="#d4a853"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#d4a853', stroke: '#1a1a1a', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="ganancia"
            name="Ganancia"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#22c55e', stroke: '#1a1a1a', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
