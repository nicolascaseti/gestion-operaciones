import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ventaFilterSchema, createVentaSchema } from '@/lib/validations/venta'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = ventaFilterSchema.parse(Object.fromEntries(searchParams))

    const where = {
      ...(filters.fechaDesde &&
        filters.fechaHasta && {
          fecha: {
            gte: new Date(filters.fechaDesde),
            lte: new Date(filters.fechaHasta + 'T23:59:59'),
          },
        }),
      ...(filters.clienteId && { clienteId: filters.clienteId }),
      ...(filters.formaPagoId && { formaPagoId: filters.formaPagoId }),
      ...(filters.productoId && { productoId: filters.productoId }),
    }

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          cliente: true,
          formaPago: true,
          producto: true,
        },
        orderBy: { fecha: 'desc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.sale.count({ where }),
    ])

    return NextResponse.json({
      data,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Error al obtener las ventas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createVentaSchema.parse(body)

    const producto = await prisma.product.findUnique({
      where: { id: data.productoId },
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const ventaTotal = data.unidades * data.precioUnitario
    const costoTotal = data.unidades * data.costoAsignado
    const ganancia = ventaTotal - costoTotal
    const margenPorcentaje = ventaTotal > 0 ? (ganancia / ventaTotal) * 100 : 0

    const venta = await prisma.sale.create({
      data: {
        fecha: data.fecha,
        formaPagoId: data.formaPagoId,
        clienteId: data.clienteId,
        productoId: data.productoId,
        codigoProducto: producto.codigo,
        nombreProducto: producto.nombre,
        unidades: data.unidades,
        precioUnitario: data.precioUnitario,
        ventaTotal,
        costoAsignado: costoTotal,
        ganancia,
        margenPorcentaje,
        notas: data.notas || null,
      },
      include: {
        cliente: true,
        formaPago: true,
        producto: true,
      },
    })

    return NextResponse.json(venta, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Error al crear la venta' },
      { status: 500 }
    )
  }
}
