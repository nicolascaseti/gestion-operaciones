/**
 * MÓDULO DE ANALÍTICAS
 *
 * Este módulo contiene la lógica de cálculo para todos los KPIs del dashboard.
 *
 * METODOLOGÍA DE CÁLCULO:
 * - CMV (Costo de Mercadería Vendida): Usamos Promedio Ponderado por simplicidad.
 *   En un sistema más complejo, FIFO sería preferible para mayor precisión.
 * - Margen Bruto = Ventas - CMV
 * - Margen % = (Margen / Ventas) * 100
 * - Rotación de Inventario = CMV / Inventario Promedio
 * - Días de Inventario = 365 / Rotación
 * - Ticket Promedio = Ventas Totales / Número de Transacciones
 */

import { prisma } from './prisma'
import {
  startOfDay,
  endOfDay,
  subDays,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth
} from 'date-fns'

export interface DateRange {
  from: Date
  to: Date
}

export interface KPIData {
  value: number
  previousValue: number
  change: number
  changePercent: number
}

export interface SalesOverTime {
  date: string
  ventas: number
  costos: number
  ganancia: number
}

export interface ProductRanking {
  id: number
  codigo: string
  nombre: string
  unidades: number
  ventas: number
  costo: number
  ganancia: number
  margen: number
}

export interface CustomerRanking {
  id: number
  nombre: string
  totalComprado: number
  transacciones: number
  ticketPromedio: number
  porcentajeTotal: number
}

export interface SupplierDependency {
  id: number
  nombre: string
  totalComprado: number
  porcentajeTotal: number
}

export interface AnalyticsData {
  kpis: {
    ventasTotales: KPIData
    comprasTotales: KPIData
    gananciaBruta: KPIData
    margenBruto: KPIData
    ticketPromedio: KPIData
    unidadesVendidas: KPIData
  }
  salesOverTime: SalesOverTime[]
  topProducts: ProductRanking[]
  topCustomers: CustomerRanking[]
  supplierDependency: SupplierDependency[]
  inventory: {
    stockUnidades: number
    stockValorizado: number
    productosSinMovimiento: number
    rotacion: number
    diasInventario: number
  }
}

function calculateKPI(current: number, previous: number): KPIData {
  const change = current - previous
  const changePercent = previous !== 0 ? ((change / previous) * 100) : (current > 0 ? 100 : 0)

  return {
    value: current,
    previousValue: previous,
    change,
    changePercent: Math.round(changePercent * 100) / 100
  }
}

export async function getAnalytics(dateRange: DateRange): Promise<AnalyticsData> {
  const { from, to } = dateRange

  // Calcular período anterior para comparación
  const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  const previousFrom = subDays(from, daysDiff)
  const previousTo = subDays(to, daysDiff)

  // Obtener datos del período actual
  const [
    currentSales,
    currentPurchases,
    previousSales,
    previousPurchases,
    topProducts,
    topCustomers,
    suppliers,
    inventory
  ] = await Promise.all([
    // Ventas período actual
    prisma.sale.findMany({
      where: {
        fecha: { gte: startOfDay(from), lte: endOfDay(to) }
      },
      include: { cliente: true, producto: true }
    }),
    // Compras período actual
    prisma.purchase.findMany({
      where: {
        fecha: { gte: startOfDay(from), lte: endOfDay(to) }
      },
      include: { proveedor: true }
    }),
    // Ventas período anterior
    prisma.sale.findMany({
      where: {
        fecha: { gte: startOfDay(previousFrom), lte: endOfDay(previousTo) }
      }
    }),
    // Compras período anterior
    prisma.purchase.findMany({
      where: {
        fecha: { gte: startOfDay(previousFrom), lte: endOfDay(previousTo) }
      }
    }),
    // Top productos
    prisma.sale.groupBy({
      by: ['productoId', 'codigoProducto', 'nombreProducto'],
      where: {
        fecha: { gte: startOfDay(from), lte: endOfDay(to) }
      },
      _sum: {
        unidades: true,
        ventaTotal: true,
        costoAsignado: true,
        ganancia: true
      },
      orderBy: {
        _sum: { ventaTotal: 'desc' }
      },
      take: 10
    }),
    // Top clientes
    prisma.sale.groupBy({
      by: ['clienteId'],
      where: {
        fecha: { gte: startOfDay(from), lte: endOfDay(to) }
      },
      _sum: { ventaTotal: true },
      _count: { id: true },
      orderBy: {
        _sum: { ventaTotal: 'desc' }
      },
      take: 5
    }),
    // Proveedores
    prisma.purchase.groupBy({
      by: ['proveedorId'],
      where: {
        fecha: { gte: startOfDay(from), lte: endOfDay(to) }
      },
      _sum: { costoTotal: true },
      orderBy: {
        _sum: { costoTotal: 'desc' }
      }
    }),
    // Inventario - productos activos
    prisma.product.findMany({
      where: { activo: true },
      include: {
        compras: {
          orderBy: { fecha: 'desc' },
          take: 1
        },
        ventas: {
          where: {
            fecha: { gte: subDays(new Date(), 30) }
          }
        }
      }
    })
  ])

  // Calcular KPIs
  const currentVentas = currentSales.reduce((sum, s) => sum + Number(s.ventaTotal), 0)
  const previousVentas = previousSales.reduce((sum, s) => sum + Number(s.ventaTotal), 0)

  const currentCompras = currentPurchases.reduce((sum, p) => sum + Number(p.costoTotal), 0)
  const previousCompras = previousPurchases.reduce((sum, p) => sum + Number(p.costoTotal), 0)

  const currentGanancia = currentSales.reduce((sum, s) => sum + Number(s.ganancia), 0)
  const previousGanancia = previousSales.reduce((sum, s) => sum + Number(s.ganancia), 0)

  const currentMargen = currentVentas > 0 ? (currentGanancia / currentVentas) * 100 : 0
  const previousMargen = previousVentas > 0 ? (previousGanancia / previousVentas) * 100 : 0

  const currentTicket = currentSales.length > 0 ? currentVentas / currentSales.length : 0
  const previousTicket = previousSales.length > 0 ? previousVentas / previousSales.length : 0

  const currentUnidades = currentSales.reduce((sum, s) => sum + Number(s.unidades), 0)
  const previousUnidades = previousSales.reduce((sum, s) => sum + Number(s.unidades), 0)

  // Generar datos de ventas en el tiempo
  const salesOverTime = await generateSalesOverTime(from, to, daysDiff)

  // Obtener nombres de clientes
  const clienteIds = topCustomers.map(c => c.clienteId)
  const clientes = await prisma.customer.findMany({
    where: { id: { in: clienteIds } }
  })
  const clienteMap = new Map(clientes.map(c => [c.id, c.nombre]))

  // Obtener nombres de proveedores
  const proveedorIds = suppliers.map(s => s.proveedorId)
  const proveedores = await prisma.supplier.findMany({
    where: { id: { in: proveedorIds } }
  })
  const proveedorMap = new Map(proveedores.map(p => [p.id, p.nombre]))

  const totalComprasProveedores = suppliers.reduce((sum, s) => sum + Number(s._sum.costoTotal || 0), 0)

  // Calcular inventario
  const stockUnidades = inventory.reduce((sum, p) => {
    const comprado = p.compras.reduce((s, c) => s + Number(c.cantidad), 0)
    const vendido = p.ventas.reduce((s, v) => s + Number(v.unidades), 0)
    return sum + Math.max(0, comprado - vendido)
  }, 0)

  const stockValorizado = inventory.reduce((sum, p) => {
    const ultimaCompra = p.compras[0]
    const costoUnitario = ultimaCompra ? Number(ultimaCompra.costoUnitario) : Number(p.costoDefault)
    const comprado = p.compras.reduce((s, c) => s + Number(c.cantidad), 0)
    const vendido = p.ventas.reduce((s, v) => s + Number(v.unidades), 0)
    const stock = Math.max(0, comprado - vendido)
    return sum + (stock * costoUnitario)
  }, 0)

  const productosSinMovimiento = inventory.filter(p => p.ventas.length === 0).length

  // Rotación de inventario = CMV / Inventario Promedio
  const cmv = currentSales.reduce((sum, s) => sum + Number(s.costoAsignado), 0)
  const rotacion = stockValorizado > 0 ? cmv / stockValorizado : 0
  const diasInventario = rotacion > 0 ? Math.round(365 / rotacion) : 0

  return {
    kpis: {
      ventasTotales: calculateKPI(currentVentas, previousVentas),
      comprasTotales: calculateKPI(currentCompras, previousCompras),
      gananciaBruta: calculateKPI(currentGanancia, previousGanancia),
      margenBruto: calculateKPI(currentMargen, previousMargen),
      ticketPromedio: calculateKPI(currentTicket, previousTicket),
      unidadesVendidas: calculateKPI(currentUnidades, previousUnidades)
    },
    salesOverTime,
    topProducts: topProducts.map(p => ({
      id: p.productoId,
      codigo: p.codigoProducto,
      nombre: p.nombreProducto,
      unidades: Number(p._sum.unidades) || 0,
      ventas: Number(p._sum.ventaTotal) || 0,
      costo: Number(p._sum.costoAsignado) || 0,
      ganancia: Number(p._sum.ganancia) || 0,
      margen: Number(p._sum.ventaTotal) > 0
        ? (Number(p._sum.ganancia) / Number(p._sum.ventaTotal)) * 100
        : 0
    })),
    topCustomers: topCustomers.map(c => {
      const total = Number(c._sum.ventaTotal) || 0
      return {
        id: c.clienteId,
        nombre: clienteMap.get(c.clienteId) || 'Desconocido',
        totalComprado: total,
        transacciones: c._count.id,
        ticketPromedio: c._count.id > 0 ? total / c._count.id : 0,
        porcentajeTotal: currentVentas > 0 ? (total / currentVentas) * 100 : 0
      }
    }),
    supplierDependency: suppliers.map(s => {
      const total = Number(s._sum.costoTotal) || 0
      return {
        id: s.proveedorId,
        nombre: proveedorMap.get(s.proveedorId) || 'Desconocido',
        totalComprado: total,
        porcentajeTotal: totalComprasProveedores > 0 ? (total / totalComprasProveedores) * 100 : 0
      }
    }),
    inventory: {
      stockUnidades,
      stockValorizado,
      productosSinMovimiento,
      rotacion: Math.round(rotacion * 100) / 100,
      diasInventario
    }
  }
}

async function generateSalesOverTime(from: Date, to: Date, daysDiff: number): Promise<SalesOverTime[]> {
  // Si el rango es menor a 60 días, mostrar por día; sino por mes
  const useDaily = daysDiff <= 60

  if (useDaily) {
    const days = eachDayOfInterval({ start: from, end: to })

    const salesByDay = await prisma.sale.groupBy({
      by: ['fecha'],
      where: {
        fecha: { gte: startOfDay(from), lte: endOfDay(to) }
      },
      _sum: {
        ventaTotal: true,
        costoAsignado: true,
        ganancia: true
      }
    })

    const salesMap = new Map(
      salesByDay.map(s => [
        format(s.fecha, 'yyyy-MM-dd'),
        {
          ventas: Number(s._sum.ventaTotal) || 0,
          costos: Number(s._sum.costoAsignado) || 0,
          ganancia: Number(s._sum.ganancia) || 0
        }
      ])
    )

    return days.map(day => {
      const key = format(day, 'yyyy-MM-dd')
      const data = salesMap.get(key) || { ventas: 0, costos: 0, ganancia: 0 }
      return {
        date: format(day, 'dd/MM'),
        ...data
      }
    })
  } else {
    const months = eachMonthOfInterval({ start: from, end: to })

    const results: SalesOverTime[] = []

    for (const month of months) {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const sales = await prisma.sale.aggregate({
        where: {
          fecha: { gte: monthStart, lte: monthEnd }
        },
        _sum: {
          ventaTotal: true,
          costoAsignado: true,
          ganancia: true
        }
      })

      results.push({
        date: format(month, 'MMM yy'),
        ventas: Number(sales._sum.ventaTotal) || 0,
        costos: Number(sales._sum.costoAsignado) || 0,
        ganancia: Number(sales._sum.ganancia) || 0
      })
    }

    return results
  }
}
