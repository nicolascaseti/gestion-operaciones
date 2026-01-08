import { NextResponse } from 'next/server'
import { getInventory, getCategories } from '@/lib/inventory'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [inventory, categories] = await Promise.all([
      getInventory(),
      getCategories(),
    ])

    return NextResponse.json({ inventory, categories })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Error al obtener el inventario' },
      { status: 500 }
    )
  }
}
