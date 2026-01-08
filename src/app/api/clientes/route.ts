import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClienteSchema } from '@/lib/validations/catalogos'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const clientes = await prisma.customer.findMany({
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ data: clientes })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Error al obtener los clientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createClienteSchema.parse(body)

    const cliente = await prisma.customer.create({
      data: {
        nombre: data.nombre,
        contacto: data.contacto || null,
        telefono: data.telefono || null,
        email: data.email || null,
        activo: data.activo,
      },
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Error al crear el cliente' },
      { status: 500 }
    )
  }
}
