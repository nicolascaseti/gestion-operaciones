import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateFormaPagoSchema } from '@/lib/validations/catalogos'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formaPago = await prisma.paymentMethod.findUnique({
      where: { id: parseInt(id) },
    })

    if (!formaPago) {
      return NextResponse.json(
        { error: 'Forma de pago no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(formaPago)
  } catch (error) {
    console.error('Error fetching payment method:', error)
    return NextResponse.json(
      { error: 'Error al obtener la forma de pago' },
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
    const data = updateFormaPagoSchema.parse(body)

    if (data.nombre) {
      const existing = await prisma.paymentMethod.findFirst({
        where: {
          nombre: data.nombre,
          NOT: { id: parseInt(id) },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Ya existe otra forma de pago con ese nombre' },
          { status: 400 }
        )
      }
    }

    const formaPago = await prisma.paymentMethod.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.activo !== undefined && { activo: data.activo }),
      },
    })

    return NextResponse.json(formaPago)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating payment method:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la forma de pago' },
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
    await prisma.paymentMethod.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la forma de pago' },
      { status: 500 }
    )
  }
}
