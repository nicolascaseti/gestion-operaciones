import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProveedorSchema } from '@/lib/validations/catalogos'
import { z } from 'zod'

export async function GET() {
  try {
    const proveedores = await prisma.supplier.findMany({
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json({ data: proveedores })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Error al obtener los proveedores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createProveedorSchema.parse(body)

    const proveedor = await prisma.supplier.create({
      data: {
        nombre: data.nombre,
        contacto: data.contacto || null,
        telefono: data.telefono || null,
        email: data.email || null,
        activo: data.activo,
      },
    })

    return NextResponse.json(proveedor, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { error: 'Error al crear el proveedor' },
      { status: 500 }
    )
  }
}
