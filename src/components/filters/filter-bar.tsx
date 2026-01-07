'use client'

import { DateRangeFilter } from './date-range-filter'
import { SelectFilter } from './select-filter'
import { ExportButton } from '@/components/exports/export-button'
import { Button } from '@/components/ui/button'
import { SelectOption } from '@/components/ui/select'
import { X } from 'lucide-react'

interface FilterConfig {
  key: string
  label: string
  options: SelectOption[]
  placeholder?: string
}

interface FilterBarProps {
  showDateRange?: boolean
  fechaDesde?: string
  fechaHasta?: string
  onFechaDesdeChange?: (value: string | undefined) => void
  onFechaHastaChange?: (value: string | undefined) => void
  filters?: FilterConfig[]
  filterValues?: Record<string, string | undefined>
  onFilterChange?: (key: string, value: string | undefined) => void
  onClearFilters?: () => void
  exportPath?: string
}

export function FilterBar({
  showDateRange = true,
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  exportPath,
}: FilterBarProps) {
  const hasActiveFilters =
    fechaDesde ||
    fechaHasta ||
    Object.values(filterValues).some((v) => v !== undefined)

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {showDateRange && onFechaDesdeChange && onFechaHastaChange && (
        <DateRangeFilter
          startDate={fechaDesde}
          endDate={fechaHasta}
          onStartDateChange={onFechaDesdeChange}
          onEndDateChange={onFechaHastaChange}
        />
      )}

      {filters.map((filter) => (
        <SelectFilter
          key={filter.key}
          label={filter.label}
          options={filter.options}
          value={filterValues[filter.key]}
          onChange={(value) => onFilterChange?.(filter.key, value)}
          placeholder={filter.placeholder || `Todos los ${filter.label.toLowerCase()}`}
        />
      ))}

      {hasActiveFilters && onClearFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4" />
          Limpiar
        </Button>
      )}

      {exportPath && (
        <div className="ml-auto">
          <ExportButton exportPath={exportPath} />
        </div>
      )}
    </div>
  )
}
