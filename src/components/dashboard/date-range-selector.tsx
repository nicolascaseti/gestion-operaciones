'use client'

import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateRangeSelectorProps {
  selectedRange: string
  onRangeChange: (range: string, from?: Date, to?: Date) => void
}

const presetRanges = [
  { label: '7 dias', value: '7' },
  { label: '30 dias', value: '30' },
  { label: '90 dias', value: '90' },
  { label: 'Este mes', value: 'month' },
  { label: 'Personalizado', value: 'custom' },
]

export function DateRangeSelector({ selectedRange, onRangeChange }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const handlePresetClick = (value: string) => {
    if (value === 'custom') {
      return
    }
    onRangeChange(value)
    setIsOpen(false)
  }

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onRangeChange('custom', new Date(customFrom), new Date(customTo))
      setIsOpen(false)
    }
  }

  const getDisplayText = () => {
    const preset = presetRanges.find(r => r.value === selectedRange)
    if (preset && preset.value !== 'custom') {
      return preset.label
    }
    if (selectedRange === 'custom' && customFrom && customTo) {
      return `${format(new Date(customFrom), 'dd/MM/yy')} - ${format(new Date(customTo), 'dd/MM/yy')}`
    }
    return 'Ultimos 30 dias'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-700 px-4 py-2.5',
          'text-sm text-white transition-all duration-200',
          'hover:border-gold-400/50 hover:bg-dark-600',
          isOpen && 'border-gold-400 ring-1 ring-gold-400/20'
        )}
      >
        <Calendar className="h-4 w-4 text-gold-400" />
        <span>{getDisplayText()}</span>
        <ChevronDown className={cn('h-4 w-4 text-dark-300 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-dark-500 bg-dark-800 p-4 shadow-dark-lg">
            <div className="space-y-1">
              {presetRanges.filter(r => r.value !== 'custom').map((range) => (
                <button
                  key={range.value}
                  onClick={() => handlePresetClick(range.value)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    selectedRange === range.value
                      ? 'bg-gold-400/10 text-gold-400'
                      : 'text-dark-100 hover:bg-dark-600'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="my-3 border-t border-dark-600" />

            <div className="space-y-3">
              <p className="text-xs font-medium text-dark-300">Rango personalizado</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-dark-400">Desde</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full rounded-lg border border-dark-500 bg-dark-700 px-2 py-1.5 text-sm text-white focus:border-gold-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-dark-400">Hasta</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full rounded-lg border border-dark-500 bg-dark-700 px-2 py-1.5 text-sm text-white focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleCustomApply}
                disabled={!customFrom || !customTo}
                className={cn(
                  'w-full rounded-lg bg-gold-400 py-2 text-sm font-medium text-dark-900 transition-colors',
                  'hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                Aplicar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
