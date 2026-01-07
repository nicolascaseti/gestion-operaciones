'use client'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Users, Crown } from 'lucide-react'

interface Customer {
  id: number
  nombre: string
  totalComprado: number
  transacciones: number
  ticketPromedio: number
  porcentajeTotal: number
}

interface CustomersRankingProps {
  data: Customer[]
}

export function CustomersRanking({ data }: CustomersRankingProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dark-600 bg-dark-700 p-6">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-dark-500" />
          <p className="mt-2 text-dark-300">No hay clientes en este periodo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-dark-600 bg-dark-700 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Crown className="h-5 w-5 text-gold-400" />
        <h3 className="text-lg font-semibold text-white">Top Clientes</h3>
      </div>

      <div className="space-y-3">
        {data.map((customer, index) => (
          <div
            key={customer.id}
            className={cn(
              'flex items-center gap-4 rounded-lg p-3 transition-colors',
              'border border-dark-600 hover:border-dark-500 hover:bg-dark-600/50'
            )}
          >
            {/* Ranking badge */}
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                index === 0 && 'bg-gold-400 text-dark-900',
                index === 1 && 'bg-dark-300 text-dark-900',
                index === 2 && 'bg-amber-700 text-white',
                index > 2 && 'bg-dark-600 text-dark-200'
              )}
            >
              {index + 1}
            </div>

            {/* Customer info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{customer.nombre}</p>
              <div className="flex items-center gap-3 text-xs text-dark-300">
                <span>{customer.transacciones} compras</span>
                <span>Ticket: {formatCurrency(customer.ticketPromedio)}</span>
              </div>
            </div>

            {/* Amount & percentage */}
            <div className="text-right">
              <p className="font-semibold text-gold-400">{formatCurrency(customer.totalComprado)}</p>
              <div className="flex items-center justify-end gap-1">
                <div className="w-12 h-1.5 rounded-full bg-dark-600 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold-400"
                    style={{ width: `${Math.min(100, customer.porcentajeTotal)}%` }}
                  />
                </div>
                <span className="text-xs text-dark-300 min-w-[35px] text-right">
                  {customer.porcentajeTotal.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
