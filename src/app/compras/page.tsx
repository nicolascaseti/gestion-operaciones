'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/filters/filter-bar'
import { DataTable } from '@/components/tables/data-table'
import { PageLoading } from '@/components/ui/loading'
import { formatCurrency, formatDate, parseDecimal } from '@/lib/utils'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import { ExcelImportModal } from '@/components/import/excel-import-modal'
import { ColumnDef } from '@tanstack/react-table'

interface Compra {
  id: number
  fecha: string
  codigoProducto: string
  nombreProducto: string
  cantidad: string | number
  costoUnitario: string | number
  costoTotal: string | number
  notas: string | null
  proveedor: { id: number; nombre: string }
  producto: { id: number; codigo: string; nombre: string }
}

interface Proveedor {
  id: number
  nombre: string
}

interface Producto {
  id: number
  codigo: string
  nombre: string
}

function ComprasContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [compras, setCompras] = useState<Compra[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)

  const fechaDesde = searchParams.get('fechaDesde') || undefined
  const fechaHasta = searchParams.get('fechaHasta') || undefined
  const proveedorId = searchParams.get('proveedorId') || undefined
  const productoId = searchParams.get('productoId') || undefined
  const page = parseInt(searchParams.get('page') || '1')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.set('fechaDesde', fechaDesde)
      if (fechaHasta) params.set('fechaHasta', fechaHasta)
      if (proveedorId) params.set('proveedorId', proveedorId)
      if (productoId) params.set('productoId', productoId)
      params.set('page', page.toString())

      const [comprasRes, proveedoresRes, productosRes] = await Promise.all([
        fetch(`/api/compras?${params}`),
        fetch('/api/proveedores'),
        fetch('/api/productos'),
      ])

      const comprasData = await comprasRes.json()
      const proveedoresData = await proveedoresRes.json()
      const productosData = await productosRes.json()

      setCompras(comprasData.data)
      setPagination(comprasData.pagination)
      setProveedores(proveedoresData.data)
      setProductos(productosData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fechaDesde, fechaHasta, proveedorId, productoId, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.set('page', '1')
    router.push(`/compras?${params}`)
  }

  const clearFilters = () => {
    router.push('/compras')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Seguro que desea eliminar esta compra?')) return

    try {
      const response = await fetch(`/api/compras/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      fetchData()
    } catch (error) {
      alert('Error al eliminar la compra')
    }
  }

  const columns: ColumnDef<Compra, unknown>[] = [
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }) => formatDate(row.original.fecha),
    },
    {
      accessorKey: 'proveedor.nombre',
      header: 'Proveedor',
    },
    {
      accessorKey: 'codigoProducto',
      header: 'Codigo',
    },
    {
      accessorKey: 'nombreProducto',
      header: 'Producto',
    },
    {
      accessorKey: 'cantidad',
      header: 'Cantidad',
      cell: ({ row }) => parseDecimal(row.original.cantidad).toFixed(2),
    },
    {
      accessorKey: 'costoUnitario',
      header: 'Costo Unit.',
      cell: ({ row }) => formatCurrency(parseDecimal(row.original.costoUnitario)),
    },
    {
      accessorKey: 'costoTotal',
      header: 'Costo Total',
      cell: ({ row }) => formatCurrency(parseDecimal(row.original.costoTotal)),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link href={`/compras/${row.original.id}/editar`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Lista de Compras</h2>
          <p className="text-sm text-dark-300">{pagination.total} registros</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4" />
            Importar Excel
          </Button>
          <Link href="/compras/nuevo">
            <Button>
              <Plus className="h-4 w-4" />
              Nueva Compra
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
        type="compras"
        templateColumns={[
          { header: 'Fecha', key: 'fecha', required: true, example: '15/01/2024' },
          { header: 'Proveedor', key: 'proveedor', required: true, example: 'Nombre Proveedor' },
          { header: 'Codigo', key: 'codigo', required: true, example: 'PROD001' },
          { header: 'Producto', key: 'producto', required: false, example: 'Nombre Producto' },
          { header: 'Cantidad', key: 'cantidad', required: true, example: '10' },
          { header: 'Costo_Unitario', key: 'costo_unitario', required: false, example: '150.50' },
          { header: 'Notas', key: 'notas', required: false, example: 'Observaciones' },
        ]}
      />

      <FilterBar
        showDateRange
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onFechaDesdeChange={(v) => setFilter('fechaDesde', v)}
        onFechaHastaChange={(v) => setFilter('fechaHasta', v)}
        filters={[
          {
            key: 'proveedorId',
            label: 'Proveedor',
            options: proveedores.map((p) => ({ value: p.id.toString(), label: p.nombre })),
          },
          {
            key: 'productoId',
            label: 'Producto',
            options: productos.map((p) => ({ value: p.id.toString(), label: p.nombre })),
          },
        ]}
        filterValues={{ proveedorId, productoId }}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        exportPath="/api/exports/purchases.xlsx"
      />

      <DataTable
        data={compras}
        columns={columns}
        pagination={pagination}
        onPageChange={(p) => setFilter('page', p.toString())}
        isLoading={isLoading}
      />
    </div>
  )
}

export default function ComprasPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ComprasContent />
    </Suspense>
  )
}
