import { prisma } from './prisma'
import { Decimal } from '@prisma/client/runtime/library'

export interface InventoryItem {
  id: number
  codigo: string
  nombre: string
  categoria: string | null
  descripcion: string | null
  imagen: string | null
  stockInicial: number
  entradas: number
  salidas: number
  stockActual: number
  costoUnitario: number
  valorTotal: number
  precioVenta: number
  margen: number
  stockMinimo: number
  estado: 'agotado' | 'bajo' | 'normal'
}

export interface InventoryDetail extends InventoryItem {
  movimientos: Movement[]
}

export interface Movement {
  id: number
  fecha: Date
  tipo: 'entrada' | 'salida'
  cantidad: number
  referencia: string
  costoUnitario?: number
  precioUnitario?: number
}

export async function getInventory(tenantId: string): Promise<InventoryItem[]> {
  const productos = await prisma.product.findMany({
    where: { tenantId, activo: true },
    include: {
      compras: {
        select: {
          cantidad: true,
          costoUnitario: true,
          fecha: true,
        },
        orderBy: { fecha: 'desc' },
      },
      ventas: {
        select: {
          unidades: true,
          precioUnitario: true,
          fecha: true,
        },
        orderBy: { fecha: 'desc' },
      },
    },
    orderBy: { nombre: 'asc' },
  })

  return productos.map((producto) => {
    const stockInicial = Number(producto.stockInicial)
    const entradas = producto.compras.reduce(
      (sum, c) => sum + Number(c.cantidad),
      0
    )
    const salidas = producto.ventas.reduce(
      (sum, v) => sum + Number(v.unidades),
      0
    )
    const stockActual = stockInicial + entradas - salidas

    // Costo: ultimo costo de compra o costo default
    const ultimaCompra = producto.compras[0]
    const costoUnitario = ultimaCompra
      ? Number(ultimaCompra.costoUnitario)
      : Number(producto.costoDefault)

    // Precio: ultimo precio de venta o precio default
    const ultimaVenta = producto.ventas[0]
    const precioVenta = ultimaVenta
      ? Number(ultimaVenta.precioUnitario)
      : Number(producto.precioDefault)

    const valorTotal = stockActual * costoUnitario
    const margen =
      precioVenta > 0 ? ((precioVenta - costoUnitario) / precioVenta) * 100 : 0

    // Estado del stock
    let estado: 'agotado' | 'bajo' | 'normal' = 'normal'
    if (stockActual <= 0) {
      estado = 'agotado'
    } else if (stockActual <= Number(producto.stockMinimo)) {
      estado = 'bajo'
    }

    return {
      id: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: producto.categoria,
      descripcion: producto.descripcion,
      imagen: producto.imagen,
      stockInicial,
      entradas,
      salidas,
      stockActual,
      costoUnitario,
      valorTotal,
      precioVenta,
      margen,
      stockMinimo: Number(producto.stockMinimo),
      estado,
    }
  })
}

export async function getInventoryDetail(tenantId: string, id: number): Promise<InventoryDetail | null> {
  const producto = await prisma.product.findFirst({
    where: { id, tenantId },
    include: {
      compras: {
        select: {
          id: true,
          fecha: true,
          cantidad: true,
          costoUnitario: true,
        },
        orderBy: { fecha: 'desc' },
      },
      ventas: {
        select: {
          id: true,
          fecha: true,
          unidades: true,
          precioUnitario: true,
        },
        orderBy: { fecha: 'desc' },
      },
    },
  })

  if (!producto) return null

  const stockInicial = Number(producto.stockInicial)
  const entradas = producto.compras.reduce(
    (sum, c) => sum + Number(c.cantidad),
    0
  )
  const salidas = producto.ventas.reduce(
    (sum, v) => sum + Number(v.unidades),
    0
  )
  const stockActual = stockInicial + entradas - salidas

  const ultimaCompra = producto.compras[0]
  const costoUnitario = ultimaCompra
    ? Number(ultimaCompra.costoUnitario)
    : Number(producto.costoDefault)

  const ultimaVenta = producto.ventas[0]
  const precioVenta = ultimaVenta
    ? Number(ultimaVenta.precioUnitario)
    : Number(producto.precioDefault)

  const valorTotal = stockActual * costoUnitario
  const margen =
    precioVenta > 0 ? ((precioVenta - costoUnitario) / precioVenta) * 100 : 0

  let estado: 'agotado' | 'bajo' | 'normal' = 'normal'
  if (stockActual <= 0) {
    estado = 'agotado'
  } else if (stockActual <= Number(producto.stockMinimo)) {
    estado = 'bajo'
  }

  // Combinar movimientos de compras y ventas
  const movimientos: Movement[] = [
    ...producto.compras.map((c) => ({
      id: c.id,
      fecha: c.fecha,
      tipo: 'entrada' as const,
      cantidad: Number(c.cantidad),
      referencia: `Compra #${c.id}`,
      costoUnitario: Number(c.costoUnitario),
    })),
    ...producto.ventas.map((v) => ({
      id: v.id,
      fecha: v.fecha,
      tipo: 'salida' as const,
      cantidad: Number(v.unidades),
      referencia: `Venta #${v.id}`,
      precioUnitario: Number(v.precioUnitario),
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  return {
    id: producto.id,
    codigo: producto.codigo,
    nombre: producto.nombre,
    categoria: producto.categoria,
    descripcion: producto.descripcion,
    imagen: producto.imagen,
    stockInicial,
    entradas,
    salidas,
    stockActual,
    costoUnitario,
    valorTotal,
    precioVenta,
    margen,
    stockMinimo: Number(producto.stockMinimo),
    estado,
    movimientos,
  }
}

export async function updateInventoryProduct(
  tenantId: string,
  id: number,
  data: {
    stockInicial?: number
    stockMinimo?: number
    precioDefault?: number
    descripcion?: string
    imagen?: string
    categoria?: string
  }
) {
  return prisma.product.update({
    where: { id },
    data: {
      ...(data.stockInicial !== undefined && {
        stockInicial: new Decimal(data.stockInicial),
      }),
      ...(data.stockMinimo !== undefined && {
        stockMinimo: new Decimal(data.stockMinimo),
      }),
      ...(data.precioDefault !== undefined && {
        precioDefault: new Decimal(data.precioDefault),
      }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
      ...(data.imagen !== undefined && { imagen: data.imagen }),
      ...(data.categoria !== undefined && { categoria: data.categoria }),
    },
  })
}

export async function getCategories(tenantId: string): Promise<string[]> {
  const result = await prisma.product.findMany({
    where: {
      tenantId,
      activo: true,
      categoria: { not: null },
    },
    select: { categoria: true },
    distinct: ['categoria'],
  })

  return result
    .map((r) => r.categoria)
    .filter((c): c is string => c !== null)
    .sort()
}
