import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProveedorSchema } from '@/lib/validations/catalogos'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const proveedor = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
    })

    if (!proveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(proveedor)
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json(
      { error: 'Error al obtener el proveedor' },
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
    const data = updateProveedorSchema.parse(body)

    const proveedor = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.contacto !== undefined && { contacto: data.contacto || null }),
        ...(data.telefono !== undefined && { telefono: data.telefono || null }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.activo !== undefined && { activo: data.activo }),
      },
    })

    return NextResponse.json(proveedor)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el proveedor' },
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
    await prisma.supplier.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el proveedor' },
      { status: 500 }
    )
  }
}
