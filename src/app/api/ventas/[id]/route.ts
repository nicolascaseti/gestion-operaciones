import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateVentaSchema } from '@/lib/validations/venta'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const venta = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        formaPago: true,
        producto: true,
      },
    })

    if (!venta) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(venta)
  } catch (error) {
    console.error('Error fetching sale:', error)
    return NextResponse.json(
      { error: 'Error al obtener la venta' },
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
    const data = updateVentaSchema.parse(body)

    const existing = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    let updateData: Record<string, unknown> = {}

    if (data.fecha) updateData.fecha = data.fecha
    if (data.formaPagoId) updateData.formaPagoId = data.formaPagoId
    if (data.clienteId) updateData.clienteId = data.clienteId
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

    const unidades = data.unidades ?? Number(existing.unidades)
    const precioUnitario = data.precioUnitario ?? Number(existing.precioUnitario)
    const costoAsignadoUnit = data.costoAsignado ?? (Number(existing.costoAsignado) / Number(existing.unidades))

    if (data.unidades !== undefined) updateData.unidades = data.unidades
    if (data.precioUnitario !== undefined) updateData.precioUnitario = data.precioUnitario

    const ventaTotal = unidades * precioUnitario
    const costoTotal = unidades * costoAsignadoUnit
    const ganancia = ventaTotal - costoTotal
    const margenPorcentaje = ventaTotal > 0 ? (ganancia / ventaTotal) * 100 : 0

    updateData.ventaTotal = ventaTotal
    updateData.costoAsignado = costoTotal
    updateData.ganancia = ganancia
    updateData.margenPorcentaje = margenPorcentaje

    const venta = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        cliente: true,
        formaPago: true,
        producto: true,
      },
    })

    return NextResponse.json(venta)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating sale:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la venta' },
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
    await prisma.sale.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sale:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la venta' },
      { status: 500 }
    )
  }
}
