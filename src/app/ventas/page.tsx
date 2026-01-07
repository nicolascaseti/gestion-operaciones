'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/filters/filter-bar'
import { DataTable } from '@/components/tables/data-table'
import { PageLoading } from '@/components/ui/loading'
import { formatCurrency, formatDate, formatPercent, parseDecimal } from '@/lib/utils'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import { ExcelImportModal } from '@/components/import/excel-import-modal'
import { ColumnDef } from '@tanstack/react-table'

interface Venta {
  id: number
  fecha: string
  codigoProducto: string
  nombreProducto: string
  unidades: string | number
  precioUnitario: string | number
  ventaTotal: string | number
  costoAsignado: string | number
  ganancia: string | number
  margenPorcentaje: string | number
  notas: string | null
  cliente: { id: number; nombre: string }
  formaPago: { id: number; nombre: string }
  producto: { id: number; codigo: string; nombre: string }
}

interface Cliente {
  id: number
  nombre: string
}

interface FormaPago {
  id: number
  nombre: string
}

interface Producto {
  id: number
  codigo: string
  nombre: string
}

function VentasContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [ventas, setVentas] = useState<Venta[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
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
  const clienteId = searchParams.get('clienteId') || undefined
  const formaPagoId = searchParams.get('formaPagoId') || undefined
  const productoId = searchParams.get('productoId') || undefined
  const page = parseInt(searchParams.get('page') || '1')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.set('fechaDesde', fechaDesde)
      if (fechaHasta) params.set('fechaHasta', fechaHasta)
      if (clienteId) params.set('clienteId', clienteId)
      if (formaPagoId) params.set('formaPagoId', formaPagoId)
      if (productoId) params.set('productoId', productoId)
      params.set('page', page.toString())

      const [ventasRes, clientesRes, formasPagoRes, productosRes] = await Promise.all([
        fetch(`/api/ventas?${params}`),
        fetch('/api/clientes'),
        fetch('/api/formas-pago'),
        fetch('/api/productos'),
      ])

      const ventasData = await ventasRes.json()
      const clientesData = await clientesRes.json()
      const formasPagoData = await formasPagoRes.json()
      const productosData = await productosRes.json()

      setVentas(ventasData.data)
      setPagination(ventasData.pagination)
      setClientes(clientesData.data)
      setFormasPago(formasPagoData.data)
      setProductos(productosData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fechaDesde, fechaHasta, clienteId, formaPagoId, productoId, page])

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
    router.push(`/ventas?${params}`)
  }

  const clearFilters = () => {
    router.push('/ventas')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Seguro que desea eliminar esta venta?')) return

    try {
      const response = await fetch(`/api/ventas/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      fetchData()
    } catch (error) {
      alert('Error al eliminar la venta')
    }
  }

  const columns: ColumnDef<Venta, unknown>[] = [
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }) => formatDate(row.original.fecha),
    },
    {
      accessorKey: 'formaPago.nombre',
      header: 'Forma Pago',
    },
    {
      accessorKey: 'cliente.nombre',
      header: 'Cliente',
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
      accessorKey: 'unidades',
      header: 'Unid.',
      cell: ({ row }) => parseDecimal(row.original.unidades).toFixed(2),
    },
    {
      accessorKey: 'precioUnitario',
      header: 'P. Unit.',
      cell: ({ row }) => formatCurrency(parseDecimal(row.original.precioUnitario)),
    },
    {
      accessorKey: 'ventaTotal',
      header: 'Total',
      cell: ({ row }) => formatCurrency(parseDecimal(row.original.ventaTotal)),
    },
    {
      accessorKey: 'ganancia',
      header: 'Ganancia',
      cell: ({ row }) => {
        const ganancia = parseDecimal(row.original.ganancia)
        return (
          <span className={ganancia >= 0 ? 'text-success' : 'text-danger'}>
            {formatCurrency(ganancia)}
          </span>
        )
      },
    },
    {
      accessorKey: 'margenPorcentaje',
      header: 'Margen',
      cell: ({ row }) => {
        const margen = parseDecimal(row.original.margenPorcentaje)
        return (
          <span className={margen >= 0 ? 'text-success' : 'text-danger'}>
            {formatPercent(margen)}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link href={`/ventas/${row.original.id}/editar`}>
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
          <h2 className="text-lg font-semibold text-white">Lista de Ventas</h2>
          <p className="text-sm text-dark-300">{pagination.total} registros</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4" />
            Importar Excel
          </Button>
          <Link href="/ventas/nuevo">
            <Button>
              <Plus className="h-4 w-4" />
              Nueva Venta
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
        type="ventas"
        templateColumns={[
          { header: 'Fecha', key: 'fecha', required: true, example: '15/01/2024' },
          { header: 'Cliente', key: 'cliente', required: true, example: 'Nombre Cliente' },
          { header: 'Forma_Pago', key: 'forma_pago', required: true, example: 'Efectivo' },
          { header: 'Codigo', key: 'codigo', required: true, example: 'PROD001' },
          { header: 'Producto', key: 'producto', required: false, example: 'Nombre Producto' },
          { header: 'Unidades', key: 'unidades', required: true, example: '5' },
          { header: 'Precio_Unitario', key: 'precio_unitario', required: false, example: '250.00' },
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
            key: 'clienteId',
            label: 'Cliente',
            options: clientes.map((c) => ({ value: c.id.toString(), label: c.nombre })),
          },
          {
            key: 'formaPagoId',
            label: 'Forma Pago',
            options: formasPago.map((fp) => ({ value: fp.id.toString(), label: fp.nombre })),
          },
          {
            key: 'productoId',
            label: 'Producto',
            options: productos.map((p) => ({ value: p.id.toString(), label: p.nombre })),
          },
        ]}
        filterValues={{ clienteId, formaPagoId, productoId }}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        exportPath="/api/exports/sales.xlsx"
      />

      <DataTable
        data={ventas}
        columns={columns}
        pagination={pagination}
        onPageChange={(p) => setFilter('page', p.toString())}
        isLoading={isLoading}
      />
    </div>
  )
}

export default function VentasPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <VentasContent />
    </Suspense>
  )
}
