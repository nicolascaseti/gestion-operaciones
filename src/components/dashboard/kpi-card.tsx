'use client'

import { cn } from '@/lib/utils'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface KPICardProps {
  title: string
  value: number
  previousValue?: number
  change?: number
  changePercent?: number
  format?: 'currency' | 'percent' | 'number' | 'units'
  tooltip?: string
  icon?: React.ReactNode
  size?: 'default' | 'large'
}

export function KPICard({
  title,
  value,
  previousValue,
  change,
  changePercent,
  format = 'currency',
  tooltip,
  icon,
  size = 'default'
}: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percent':
        return `${val.toFixed(1)}%`
      case 'units':
        return val.toLocaleString('es-AR')
      default:
        return val.toLocaleString('es-AR', { maximumFractionDigits: 2 })
    }
  }

  const isPositive = (changePercent ?? 0) > 0
  const isNegative = (changePercent ?? 0) < 0
  const isNeutral = (changePercent ?? 0) === 0

  // Para algunos KPIs, negativo es bueno (ej: costos bajaron)
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus

  return (
    <div
      className={cn(
        'relative rounded-xl border border-dark-600 bg-dark-700 p-5 transition-all duration-300',
        'hover:border-dark-500 hover:shadow-dark-lg',
        size === 'large' && 'p-6'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/10 text-gold-400">
              {icon}
            </div>
          )}
          <span className="text-sm font-medium text-dark-200">{title}</span>
        </div>

        {tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-dark-300 hover:text-dark-100 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {showTooltip && (
              <div className="absolute right-0 top-6 z-50 w-64 rounded-lg border border-dark-500 bg-dark-800 p-3 shadow-dark-lg">
                <p className="text-xs text-dark-100">{tooltip}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Value */}
      <div className={cn('mt-3', size === 'large' ? 'mt-4' : 'mt-3')}>
        <span
          className={cn(
            'font-display font-bold text-white',
            size === 'large' ? 'text-3xl' : 'text-2xl'
          )}
        >
          {formatValue(value)}
        </span>
      </div>

      {/* Change indicator */}
      {changePercent !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositive && 'bg-success/10 text-success',
              isNegative && 'bg-danger/10 text-danger',
              isNeutral && 'bg-dark-500 text-dark-200'
            )}
          >
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(changePercent).toFixed(1)}%</span>
          </div>
          <span className="text-xs text-dark-300">vs período anterior</span>
        </div>
      )}

      {/* Decorative accent */}
      <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-xl">
        <div
          className={cn(
            'h-full transition-all duration-500',
            isPositive && 'bg-gradient-to-r from-success/50 to-success/20',
            isNegative && 'bg-gradient-to-r from-danger/50 to-danger/20',
            isNeutral && 'bg-gradient-to-r from-gold-400/30 to-transparent'
          )}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )
}

// Variante simplificada para métricas secundarias
export function KPICardMini({
  title,
  value,
  format = 'number',
  icon,
  color = 'gold'
}: {
  title: string
  value: number
  format?: 'currency' | 'percent' | 'number'
  icon?: React.ReactNode
  color?: 'gold' | 'success' | 'danger' | 'neutral'
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percent':
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString('es-AR')
    }
  }

  const colorClasses = {
    gold: 'text-gold-400 bg-gold-400/10',
    success: 'text-success bg-success/10',
    danger: 'text-danger bg-danger/10',
    neutral: 'text-dark-200 bg-dark-600'
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dark-600 bg-dark-700/50 p-3">
      {icon && (
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', colorClasses[color])}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-dark-300">{title}</p>
        <p className="text-lg font-semibold text-white">{formatValue(value)}</p>
      </div>
    </div>
  )
}
