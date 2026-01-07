'use client'

import { Select, SelectOption } from '@/components/ui/select'

interface SelectFilterProps {
  label: string
  options: SelectOption[]
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
}

export function SelectFilter({
  label,
  options,
  value,
  onChange,
  placeholder = 'Todos',
}: SelectFilterProps) {
  return (
    <div className="min-w-[160px]">
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        options={options}
        placeholder={placeholder}
        aria-label={label}
      />
    </div>
  )
}
