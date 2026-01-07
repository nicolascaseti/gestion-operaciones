import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateCompraSchema } from '@/lib/validations/compra'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const compra = await prisma.purchase.findUnique({
      where: { id: parseInt(id) },
      include: {
        proveedor: true,
        producto: true,
      },
    })

    if (!compra) {
      return NextResponse.json(
        { error: 'Compra no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(compra)
  } catch (error) {
    console.error('Error fetching purchase:', error)
    return NextResponse.json(
      { error: 'Error al obtener la compra' },
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
    const data = updateCompraSchema.parse(body)

    let updateData: Record<string, unknown> = {}

    if (data.fecha) updateData.fecha = data.fecha
    if (data.proveedorId) updateData.proveedorId = data.proveedorId
    if (data.notas !== undefined) updateData.notas = data.notas || null

    if (data.productoId) {
      const producto = await prisma.product.findUnique({
        where: { id: data.productoId },
      })
      if (producto) {
        updateData.productoId = data.productoId
        updateData.codigoProducto = producto.codigo
        updateData.nombreProducto = producto.nombre
      }
    }

    if (data.cantidad !== undefined) updateData.cantidad = data.cantidad
    if (data.costoUnitario !== undefined) updateData.costoUnitario = data.costoUnitario

    if (data.cantidad !== undefined || data.costoUnitario !== undefined) {
      const existing = await prisma.purchase.findUnique({
        where: { id: parseInt(id) },
      })
      if (existing) {
        const cantidad = data.cantidad ?? Number(existing.cantidad)
        const costoUnitario = data.costoUnitario ?? Number(existing.costoUnitario)
        updateData.costoTotal = cantidad * costoUnitario
      }
    }

    const compra = await prisma.purchase.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        proveedor: true,
        producto: true,
      },
    })

    return NextResponse.json(compra)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating purchase:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la compra' },
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
    await prisma.purchase.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting purchase:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la compra' },
      { status: 500 }
    )
  }
}
