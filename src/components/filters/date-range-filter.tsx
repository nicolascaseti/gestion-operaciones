'use client'

import { Input } from '@/components/ui/input'

interface DateRangeFilterProps {
  startDate?: string
  endDate?: string
  onStartDateChange: (date: string | undefined) => void
  onEndDateChange: (date: string | undefined) => void
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={startDate || ''}
        onChange={(e) => onStartDateChange(e.target.value || undefined)}
        className="w-40"
        placeholder="Desde"
      />
      <span className="text-gray-500">-</span>
      <Input
        type="date"
        value={endDate || ''}
        onChange={(e) => onEndDateChange(e.target.value || undefined)}
        className="w-40"
        placeholder="Hasta"
      />
    </div>
  )
}
