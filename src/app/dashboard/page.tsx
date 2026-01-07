'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { KPICard } from '@/components/dashboard/kpi-card'
import { DateRangeSelector } from '@/components/dashboard/date-range-selector'
import { SalesChart } from '@/components/charts/sales-chart'
import { SalesVsCostsChart } from '@/components/charts/sales-vs-costs-chart'
import { TopProductsChart } from '@/components/charts/top-products-chart'
import { MarginTable } from '@/components/charts/margin-table'
import { CustomersRanking } from '@/components/charts/customers-ranking'
import { SuppliersChart } from '@/components/charts/suppliers-chart'
import { InventoryStats } from '@/components/charts/inventory-stats'
import { AnalyticsData } from '@/lib/analytics'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Percent,
  Receipt,
  Package,
  RefreshCw
} from 'lucide-react'
import { format, subDays } from 'date-fns'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const range = searchParams.get('range') || '30'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = '/api/analytics?'
      if (from && to) {
        url += `from=${from}&to=${to}`
      } else {
        url += `range=${range}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Error al cargar datos')

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [range, from, to])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRangeChange = (newRange: string, customFrom?: Date, customTo?: Date) => {
    const params = new URLSearchParams()
    if (newRange === 'custom' && customFrom && customTo) {
      params.set('from', format(customFrom, 'yyyy-MM-dd'))
      params.set('to', format(customTo, 'yyyy-MM-dd'))
    } else {
      params.set('range', newRange)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-danger">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-dark-900 hover:bg-gold-500"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Financiero</h1>
          <p className="text-dark-300">
            Analiza el rendimiento de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-dark-500 bg-dark-700 text-dark-200 hover:bg-dark-600 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <DateRangeSelector
            selectedRange={from && to ? 'custom' : range}
            onRangeChange={handleRangeChange}
          />
        </div>
      </div>

      {isLoading && !data ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          {/* KPIs principales */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <KPICard
              title="Ventas Totales"
              value={data.kpis.ventasTotales.value}
              changePercent={data.kpis.ventasTotales.changePercent}
              format="currency"
              icon={<DollarSign className="h-4 w-4" />}
              tooltip="Suma total de todas las ventas en el periodo seleccionado. Indica el volumen de facturacion bruta."
            />
            <KPICard
              title="Compras Totales"
              value={data.kpis.comprasTotales.value}
              changePercent={data.kpis.comprasTotales.changePercent}
              format="currency"
              icon={<ShoppingCart className="h-4 w-4" />}
              tooltip="Total invertido en compras a proveedores. Un aumento puede indicar reposicion de stock o nuevos productos."
            />
            <KPICard
              title="Ganancia Bruta"
              value={data.kpis.gananciaBruta.value}
              changePercent={data.kpis.gananciaBruta.changePercent}
              format="currency"
              icon={<TrendingUp className="h-4 w-4" />}
              tooltip="Diferencia entre ventas y costo de mercaderia vendida (CMV). Representa la utilidad antes de gastos operativos."
            />
            <KPICard
              title="Margen Bruto"
              value={data.kpis.margenBruto.value}
              changePercent={data.kpis.margenBruto.changePercent}
              format="percent"
              icon={<Percent className="h-4 w-4" />}
              tooltip="Porcentaje de ganancia sobre ventas. Un margen sano para retail es 25-40%. Valores bajos indican precios no competitivos o costos altos."
            />
            <KPICard
              title="Ticket Promedio"
              value={data.kpis.ticketPromedio.value}
              changePercent={data.kpis.ticketPromedio.changePercent}
              format="currency"
              icon={<Receipt className="h-4 w-4" />}
              tooltip="Valor promedio de cada venta. Aumentarlo mejora rentabilidad sin necesidad de mas clientes."
            />
            <KPICard
              title="Unidades Vendidas"
              value={data.kpis.unidadesVendidas.value}
              changePercent={data.kpis.unidadesVendidas.changePercent}
              format="units"
              icon={<Package className="h-4 w-4" />}
              tooltip="Cantidad total de productos vendidos. Mide el volumen de operaciones."
            />
          </div>

          {/* Graficos principales */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SalesChart data={data.salesOverTime} />
            <SalesVsCostsChart data={data.salesOverTime} />
          </div>

          {/* Productos y Margen */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TopProductsChart data={data.topProducts} />
            <MarginTable data={data.topProducts} />
          </div>

          {/* Clientes y Proveedores */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CustomersRanking data={data.topCustomers} />
            <SuppliersChart data={data.supplierDependency} />
          </div>

          {/* Inventario */}
          <InventoryStats
            stockUnidades={data.inventory.stockUnidades}
            stockValorizado={data.inventory.stockValorizado}
            productosSinMovimiento={data.inventory.productosSinMovimiento}
            rotacion={data.inventory.rotacion}
            diasInventario={data.inventory.diasInventario}
          />
        </>
      ) : null}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPIs skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-dark-700 border border-dark-600" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-dark-700 border border-dark-600" />
        <div className="h-80 rounded-xl bg-dark-700 border border-dark-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 rounded-xl bg-dark-700 border border-dark-600" />
        <div className="h-96 rounded-xl bg-dark-700 border border-dark-600" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
