'use client'

import { Button } from '@/components/ui/button'
import { useFilters } from '@/hooks/use-filters'
import { Download } from 'lucide-react'
import { useState } from 'react'

interface ExportButtonProps {
  exportPath: string
  label?: string
}

export function ExportButton({ exportPath, label = 'Exportar Excel' }: ExportButtonProps) {
  const { buildExportUrl } = useFilters()
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const url = buildExportUrl(exportPath)
      const link = document.createElement('a')
      link.href = url
      link.download = ''
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  return (
    <Button
      variant="success"
      onClick={handleExport}
      disabled={isLoading}
    >
      <Download className="h-4 w-4" />
      {isLoading ? 'Exportando...' : label}
    </Button>
  )
}
