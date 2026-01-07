import { NextRequest, NextResponse } from 'next/server'
import { getInventoryDetail, updateInventoryProduct } from '@/lib/inventory'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalido' },
        { status: 400 }
      )
    }

    const detail = await getInventoryDetail(id)

    if (!detail) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(detail)
  } catch (error) {
    console.error('Error fetching inventory detail:', error)
    return NextResponse.json(
      { error: 'Error al obtener el detalle del inventario' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalido' },
        { status: 400 }
      )
    }

    const body = await request.json()

    const updated = await updateInventoryProduct(id, {
      stockInicial: body.stockInicial,
      stockMinimo: body.stockMinimo,
      precioDefault: body.precioVenta,
      descripcion: body.descripcion,
      imagen: body.imagen,
      categoria: body.categoria,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el inventario' },
      { status: 500 }
    )
  }
}
