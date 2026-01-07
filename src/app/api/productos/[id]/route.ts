import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProductoSchema } from '@/lib/validations/catalogos'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const producto = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateProductoSchema.parse(body)

    if (data.codigo) {
      const existing = await prisma.product.findFirst({
        where: {
          codigo: data.codigo,
          NOT: { id: parseInt(id) },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Ya existe otro producto con ese codigo' },
          { status: 400 }
        )
      }
    }

    const producto = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.codigo && { codigo: data.codigo }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.costoDefault !== undefined && { costoDefault: data.costoDefault }),
        ...(data.precioDefault !== undefined && { precioDefault: data.precioDefault }),
        ...(data.activo !== undefined && { activo: data.activo }),
      },
    })

    return NextResponse.json(producto)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.product.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    )
  }
}
