'use client'

import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

interface Movement {
  id: number
  fecha: Date
  tipo: 'entrada' | 'salida'
  cantidad: number
  referencia: string
  costoUnitario?: number
  precioUnitario?: number
}

interface MovementHistoryProps {
  movements: Movement[]
}

export function MovementHistory({ movements }: MovementHistoryProps) {
  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-dark-400">No hay movimientos registrados</p>
        <p className="text-xs text-dark-500 mt-1">
          Los movimientos aparecen al registrar compras o ventas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {movements.map((movement) => (
        <div
          key={`${movement.tipo}-${movement.id}`}
          className="flex items-center gap-3 rounded-lg bg-dark-800 p-3"
        >
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              movement.tipo === 'entrada' ? 'bg-success/10' : 'bg-danger/10'
            )}
          >
            {movement.tipo === 'entrada' ? (
              <ArrowDownCircle className="h-4 w-4 text-success" />
            ) : (
              <ArrowUpCircle className="h-4 w-4 text-danger" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white truncate">
                {movement.referencia}
              </p>
              <span
                className={cn(
                  'text-sm font-semibold',
                  movement.tipo === 'entrada' ? 'text-success' : 'text-danger'
                )}
              >
                {movement.tipo === 'entrada' ? '+' : '-'}
                {movement.cantidad}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-dark-400">
                {format(new Date(movement.fecha), "d 'de' MMM, yyyy", {
                  locale: es,
                })}
              </p>
              <p className="text-xs text-dark-400">
                {movement.tipo === 'entrada' && movement.costoUnitario
                  ? `Costo: ${formatCurrency(movement.costoUnitario)}`
                  : movement.tipo === 'salida' && movement.precioUnitario
                  ? `Precio: ${formatCurrency(movement.precioUnitario)}`
                  : ''}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
