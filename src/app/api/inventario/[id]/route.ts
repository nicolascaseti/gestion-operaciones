import { NextRequest, NextResponse } from 'next/server'
import { getInventoryDetail, updateInventoryProduct } from '@/lib/inventory'
import { getTenantId } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantId()
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalido' },
        { status: 400 }
      )
    }

    const detail = await getInventoryDetail(tenantId, id)

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
    const tenantId = await getTenantId()
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalido' },
        { status: 400 }
      )
    }

    const body = await request.json()

    const updated = await updateInventoryProduct(tenantId, id, {
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
