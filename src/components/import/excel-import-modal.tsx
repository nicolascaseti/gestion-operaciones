'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImportResult {
  success: number
  errors: { row: number; message: string }[]
}

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
  type: 'compras' | 'ventas'
  templateColumns: { header: string; key: string; required: boolean; example: string }[]
}

export function ExcelImportModal({
  isOpen,
  onClose,
  onImportComplete,
  type,
  templateColumns,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Por favor selecciona un archivo Excel (.xlsx o .xls)')
        return
      }
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`/api/imports/${type}`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al importar')
      }

      setResult(data)
      if (data.success > 0) {
        onImportComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadTemplate = () => {
    window.open(`/api/imports/${type}/template`, '_blank')
  }

  const handleClose = () => {
    setFile(null)
    setError(null)
    setResult(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-dark-600 bg-dark-700 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Importar {type === 'compras' ? 'Compras' : 'Ventas'}
          </h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dark-300 hover:bg-dark-600 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Descargar plantilla */}
        <div className="mb-6 rounded-lg bg-dark-800 p-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-5 w-5 text-gold-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white mb-1">
                Plantilla de Excel
              </p>
              <p className="text-xs text-dark-300 mb-3">
                Descarga la plantilla con el formato correcto para importar datos.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-4 w-4" />
                Descargar plantilla
              </Button>
            </div>
          </div>
        </div>

        {/* Columnas requeridas */}
        <div className="mb-6">
          <p className="text-sm font-medium text-dark-200 mb-2">
            Columnas del archivo:
          </p>
          <div className="rounded-lg bg-dark-800 p-3 max-h-40 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-dark-400">
                  <th className="text-left pb-2">Columna</th>
                  <th className="text-left pb-2">Requerido</th>
                  <th className="text-left pb-2">Ejemplo</th>
                </tr>
              </thead>
              <tbody className="text-dark-200">
                {templateColumns.map((col) => (
                  <tr key={col.key}>
                    <td className="py-1">{col.header}</td>
                    <td className="py-1">
                      {col.required ? (
                        <span className="text-danger">Si</span>
                      ) : (
                        <span className="text-dark-400">No</span>
                      )}
                    </td>
                    <td className="py-1 text-dark-400">{col.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subir archivo */}
        <div className="mb-6">
          <div
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
              file
                ? 'border-gold-400 bg-gold-400/5'
                : 'border-dark-500 hover:border-dark-400'
            }`}
          >
            {file ? (
              <>
                <FileSpreadsheet className="h-10 w-10 text-gold-400 mb-2" />
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-dark-400 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-dark-400 mb-2" />
                <p className="text-sm font-medium text-white">
                  Haz clic para seleccionar archivo
                </p>
                <p className="text-xs text-dark-400 mt-1">
                  Archivos .xlsx o .xls
                </p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Errores */}
        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 border border-danger/20 p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="mb-4 space-y-3">
            {result.success > 0 && (
              <div className="rounded-lg bg-success/10 border border-success/20 p-3 flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <p className="text-sm text-success">
                  {result.success} registros importados correctamente
                </p>
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="rounded-lg bg-danger/10 border border-danger/20 p-3">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-danger font-medium">
                    {result.errors.length} errores encontrados:
                  </p>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-danger/80 ml-7">
                      Fila {err.row}: {err.message}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {result ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!result && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? 'Importando...' : 'Importar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
