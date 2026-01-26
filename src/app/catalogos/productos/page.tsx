'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import { ExcelImportModal } from '@/components/import/excel-import-modal'
import { PageLoading } from '@/components/ui/loading'

interface Producto {
  id: number
  codigo: string
  nombre: string
  categoria: string | null
  costoDefault: string | number
  precioDefault: string | number
  activo: boolean
}

function ProductosContent() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/productos')
      const data = await response.json()
      setProductos(data.data || [])
    } catch (error) {
      console.error('Error fetching productos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`Seguro que desea eliminar el producto "${nombre}"?`)) return

    try {
      const response = await fetch(`/api/productos/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      fetchData()
    } catch (error) {
      alert('Error al eliminar el producto')
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Lista de Productos</h2>
          <p className="text-sm text-dark-300">{productos.length} productos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4" />
            Importar Excel
          </Button>
          <Link href="/catalogos/productos/nuevo">
            <Button>
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => {
          setShowImportModal(false)
          fetchData()
        }}
        type="productos"
        templateColumns={[
          { header: 'Codigo', key: 'codigo', required: true, example: 'PROD001' },
          { header: 'Nombre', key: 'nombre', required: true, example: 'Nombre del Producto' },
          { header: 'Categoria', key: 'categoria', required: false, example: 'General' },
          { header: 'Descripcion', key: 'descripcion', required: false, example: 'Descripcion...' },
          { header: 'Costo_Default', key: 'costo_default', required: false, example: '100' },
          { header: 'Precio_Default', key: 'precio_default', required: false, example: '150' },
          { header: 'Stock_Inicial', key: 'stock_inicial', required: false, example: '50' },
          { header: 'Stock_Minimo', key: 'stock_minimo', required: false, example: '10' },
          { header: 'Activo', key: 'activo', required: false, example: 'Si' },
        ]}
      />

      <div className="overflow-hidden rounded-xl border border-dark-600 bg-dark-700">
        <table className="w-full text-sm">
          <thead className="bg-dark-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-dark-200">Codigo</th>
              <th className="px-4 py-3 text-left font-medium text-dark-200">Nombre</th>
              <th className="px-4 py-3 text-right font-medium text-dark-200">Costo</th>
              <th className="px-4 py-3 text-right font-medium text-dark-200">Precio</th>
              <th className="px-4 py-3 text-center font-medium text-dark-200">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-dark-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-dark-400">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto.id} className="border-t border-dark-600 hover:bg-dark-600/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-white">{producto.codigo}</td>
                  <td className="px-4 py-3 text-white">{producto.nombre}</td>
                  <td className="px-4 py-3 text-right text-dark-200">
                    {formatCurrency(producto.costoDefault.toString())}
                  </td>
                  <td className="px-4 py-3 text-right text-dark-200">
                    {formatCurrency(producto.precioDefault.toString())}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        producto.activo
                          ? 'bg-success/10 text-success'
                          : 'bg-dark-600 text-dark-300'
                      }`}
                    >
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/catalogos/productos/${producto.id}/editar`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(producto.id, producto.nombre)}
                        className="text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProductosContent />
    </Suspense>
  )
}
