'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoading } from '@/components/ui/loading'
import { formatCurrency, formatDate, parseDecimal } from '@/lib/utils'
import { ExportButton } from '@/components/exports/export-button'
import { DateRangeFilter } from '@/components/filters/date-range-filter'
import { ShoppingCart, Receipt, TrendingUp, TrendingDown, X } from 'lucide-react'

interface Compra {
  id: number
  fecha: string
  nombreProducto: string
  costoTotal: string | number
  proveedor: { nombre: string }
}

interface Venta {
  id: number
  fecha: string
  nombreProducto: string
  ventaTotal: string | number
  ganancia: string | number
  cliente: { nombre: string }
  formaPago: { nombre: string }
}

function OperacionesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [compras, setCompras] = useState<Compra[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fechaDesde = searchParams.get('fechaDesde') || undefined
  const fechaHasta = searchParams.get('fechaHasta') || undefined

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.set('fechaDesde', fechaDesde)
      if (fechaHasta) params.set('fechaHasta', fechaHasta)
      params.set('pageSize', '100')

      const [comprasRes, ventasRes] = await Promise.all([
        fetch(`/api/compras?${params}`),
        fetch(`/api/ventas?${params}`),
      ])

      const comprasData = await comprasRes.json()
      const ventasData = await ventasRes.json()

      setCompras(comprasData.data)
      setVentas(ventasData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fechaDesde, fechaHasta])

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
    router.push(`/operaciones?${params}`)
  }

  const clearFilters = () => {
    router.push('/operaciones')
  }

  const totalCompras = compras.reduce(
    (sum, c) => sum + parseDecimal(c.costoTotal),
    0
  )
  const totalVentas = ventas.reduce(
    (sum, v) => sum + parseDecimal(v.ventaTotal),
    0
  )
  const totalGanancia = ventas.reduce(
    (sum, v) => sum + parseDecimal(v.ganancia),
    0
  )
  const hasFilters = fechaDesde || fechaHasta

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Operaciones</h2>
          <p className="text-sm text-gray-500">Vista combinada de compras y ventas</p>
        </div>
        <ExportButton exportPath="/api/exports/operations.xlsx" />
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <DateRangeFilter
          startDate={fechaDesde}
          endDate={fechaHasta}
          onStartDateChange={(v) => setFilter('fechaDesde', v)}
          onEndDateChange={(v) => setFilter('fechaHasta', v)}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Compras
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCompras)}</div>
            <p className="text-xs text-gray-500">{compras.length} operaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Ventas
            </CardTitle>
            <Receipt className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVentas)}</div>
            <p className="text-xs text-gray-500">{ventas.length} operaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ganancia Total
            </CardTitle>
            {totalGanancia >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalGanancia >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(totalGanancia)}
            </div>
            <p className="text-xs text-gray-500">De ventas realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalVentas - totalCompras >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(totalVentas - totalCompras)}
            </div>
            <p className="text-xs text-gray-500">Ventas - Compras</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Ultimas Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Cargando...</div>
            ) : compras.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No hay compras en el periodo seleccionado
              </div>
            ) : (
              <div className="space-y-3">
                {compras.slice(0, 10).map((compra) => (
                  <div
                    key={compra.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{compra.nombreProducto}</div>
                      <div className="text-sm text-gray-500">
                        {compra.proveedor.nombre} - {formatDate(compra.fecha)}
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      {formatCurrency(parseDecimal(compra.costoTotal))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              Ultimas Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Cargando...</div>
            ) : ventas.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No hay ventas en el periodo seleccionado
              </div>
            ) : (
              <div className="space-y-3">
                {ventas.slice(0, 10).map((venta) => (
                  <div
                    key={venta.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{venta.nombreProducto}</div>
                      <div className="text-sm text-gray-500">
                        {venta.cliente.nombre} - {formatDate(venta.fecha)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(parseDecimal(venta.ventaTotal))}
                      </div>
                      <div
                        className={`text-sm ${
                          parseDecimal(venta.ganancia) >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        +{formatCurrency(parseDecimal(venta.ganancia))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function OperacionesPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <OperacionesContent />
    </Suspense>
  )
}
