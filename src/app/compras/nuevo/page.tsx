import { prisma } from '@/lib/prisma'
import { CompraForm } from '@/components/forms/compra-form'

export const dynamic = 'force-dynamic'

export default async function NuevaCompraPage() {
  const [productos, proveedores] = await Promise.all([
    prisma.product.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.supplier.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    }),
  ])

  const productosForForm = productos.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    costoDefault: p.costoDefault.toString(),
  }))

  return <CompraForm productos={productosForForm} proveedores={proveedores} />
}
