import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantId } from '@/lib/session'
import { parseExcelFile, parseNumber } from '@/lib/excel/import'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

interface ImportError {
  row: number
  message: string
}

interface ImportResult {
  success: number
  updated: number
  errors: ImportError[]
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporciono ningun archivo' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const rows = await parseExcelFile(buffer)

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El archivo no contiene datos' },
        { status: 400 }
      )
    }

    // Obtener productos existentes para validacion de duplicados
    const productosExistentes = await prisma.product.findMany({
      where: { tenantId },
      select: { id: true, codigo: true },
    })

    const productosMap = new Map(
      productosExistentes.map((p) => [p.codigo.toLowerCase(), p])
    )

    const errors: ImportError[] = []
    const newProducts: {
      tenantId: string
      codigo: string
      nombre: string
      categoria: string | null
      descripcion: string | null
      costoDefault: Decimal
      precioDefault: Decimal
      stockInicial: Decimal
      stockMinimo: Decimal
      activo: boolean
    }[] = []
    const updatedProducts: { id: number; data: Record<string, unknown> }[] = []

    for (const row of rows) {
      const rowNum = row._rowNumber as number

      // Parsear codigo (requerido)
      const codigo = (
        (row['codigo'] || row['code'] || row['codigo_producto']) as string
      )?.trim()
      if (!codigo) {
        errors.push({ row: rowNum, message: 'Codigo de producto requerido' })
        continue
      }

      // Parsear nombre (requerido)
      const nombre = (
        (row['nombre'] || row['name'] || row['nombre_producto'] || row['producto']) as string
      )?.trim()
      if (!nombre) {
        errors.push({ row: rowNum, message: 'Nombre de producto requerido' })
        continue
      }

      // Campos opcionales
      const categoria = ((row['categoria'] || row['category']) as string)?.trim() || null
      const descripcion = ((row['descripcion'] || row['description']) as string)?.trim() || null

      // Parsear numeros con defaults
      const costoDefault = parseNumber(row['costo'] || row['costo_default'] || row['cost']) || 0
      const precioDefault = parseNumber(row['precio'] || row['precio_default'] || row['price']) || 0
      const stockInicial = parseNumber(row['stock'] || row['stock_inicial'] || row['stock_initial']) || 0
      const stockMinimo = parseNumber(row['stock_minimo'] || row['min_stock']) || 0

      // Activo
      const activoRaw = row['activo'] || row['active']
      let activo = true
      if (activoRaw !== undefined && activoRaw !== null && activoRaw !== '') {
        if (typeof activoRaw === 'boolean') {
          activo = activoRaw
        } else if (typeof activoRaw === 'string') {
          activo = !['false', 'no', '0', 'inactivo'].includes(activoRaw.toLowerCase())
        } else if (typeof activoRaw === 'number') {
          activo = activoRaw !== 0
        }
      }

      // Verificar si ya existe
      const existingProduct = productosMap.get(codigo.toLowerCase())

      if (existingProduct) {
        // Actualizar producto existente
        updatedProducts.push({
          id: existingProduct.id,
          data: {
            nombre,
            categoria,
            descripcion,
            costoDefault: new Decimal(costoDefault),
            precioDefault: new Decimal(precioDefault),
            stockInicial: new Decimal(stockInicial),
            stockMinimo: new Decimal(stockMinimo),
            activo,
          },
        })
      } else {
        // Crear nuevo producto
        newProducts.push({
          tenantId,
          codigo,
          nombre,
          categoria,
          descripcion,
          costoDefault: new Decimal(costoDefault),
          precioDefault: new Decimal(precioDefault),
          stockInicial: new Decimal(stockInicial),
          stockMinimo: new Decimal(stockMinimo),
          activo,
        })
        // Agregar al mapa para evitar duplicados en el mismo archivo
        productosMap.set(codigo.toLowerCase(), { id: -1, codigo })
      }
    }

    // Insertar nuevos productos
    if (newProducts.length > 0) {
      await prisma.product.createMany({
        data: newProducts,
      })
    }

    // Actualizar productos existentes
    for (const product of updatedProducts) {
      await prisma.product.update({
        where: { id: product.id },
        data: product.data,
      })
    }

    return NextResponse.json({
      success: newProducts.length,
      updated: updatedProducts.length,
      errors,
    })
  } catch (error) {
    console.error('Error importing products:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al procesar el archivo',
      },
      { status: 500 }
    )
  }
}
