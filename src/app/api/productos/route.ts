import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProductoSchema } from '@/lib/validations/catalogos'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const productos = await prisma.product.findMany({
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ data: productos })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createProductoSchema.parse(body)

    const existing = await prisma.product.findUnique({
      where: { codigo: data.codigo },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un producto con ese codigo' },
        { status: 400 }
      )
    }

    const producto = await prisma.product.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        costoDefault: data.costoDefault,
        precioDefault: data.precioDefault,
        activo: data.activo,
      },
    })

    return NextResponse.json(producto, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    )
  }
}
