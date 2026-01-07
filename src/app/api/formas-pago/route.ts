import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createFormaPagoSchema } from '@/lib/validations/catalogos'
import { z } from 'zod'

export async function GET() {
  try {
    const formasPago = await prisma.paymentMethod.findMany({
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ data: formasPago })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Error al obtener las formas de pago' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createFormaPagoSchema.parse(body)

    const existing = await prisma.paymentMethod.findUnique({
      where: { nombre: data.nombre },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una forma de pago con ese nombre' },
        { status: 400 }
      )
    }

    const formaPago = await prisma.paymentMethod.create({
      data: {
        nombre: data.nombre,
        activo: data.activo,
      },
    })

    return NextResponse.json(formaPago, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating payment method:', error)
    return NextResponse.json(
      { error: 'Error al crear la forma de pago' },
      { status: 500 }
    )
  }
}
