import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compraFilterSchema, createCompraSchema } from '@/lib/validations/compra'
import { getTenantId } from '@/lib/session'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const searchParams = request.nextUrl.searchParams
    const filters = compraFilterSchema.parse(Object.fromEntries(searchParams))

    const where = {
      tenantId,
      ...(filters.fechaDesde &&
        filters.fechaHasta && {
          fecha: {
            gte: new Date(filters.fechaDesde),
            lte: new Date(filters.fechaHasta + 'T23:59:59'),
          },
        }),
      ...(filters.proveedorId && { proveedorId: filters.proveedorId }),
      ...(filters.productoId && { productoId: filters.productoId }),
    }

    const [data, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          proveedor: true,
          producto: true,
        },
        orderBy: { fecha: 'desc' },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.purchase.count({ where }),
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
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Error al obtener las compras' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await request.json()
    const data = createCompraSchema.parse(body)

    const producto = await prisma.product.findFirst({
      where: { id: data.productoId, tenantId },
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const costoTotal = data.cantidad * data.costoUnitario

    const compra = await prisma.purchase.create({
      data: {
        tenantId,
        fecha: data.fecha,
        proveedorId: data.proveedorId,
        productoId: data.productoId,
        codigoProducto: producto.codigo,
        nombreProducto: producto.nombre,
        cantidad: data.cantidad,
        costoUnitario: data.costoUnitario,
        costoTotal,
        notas: data.notas || null,
      },
      include: {
        proveedor: true,
        producto: true,
      },
    })

    return NextResponse.json(compra, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating purchase:', error)
    return NextResponse.json(
      { error: 'Error al crear la compra' },
      { status: 500 }
    )
  }
}
