import { prisma } from '@/lib/prisma'
import { VentaForm } from '@/components/forms/venta-form'

export const dynamic = 'force-dynamic'

export default async function NuevaVentaPage() {
  const [productos, clientes, formasPago] = await Promise.all([
    prisma.product.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.customer.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.paymentMethod.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    }),
  ])

  const productosForForm = productos.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    costoDefault: p.costoDefault.toString(),
    precioDefault: p.precioDefault.toString(),
  }))

  return (
    <VentaForm
      productos={productosForForm}
      clientes={clientes}
      formasPago={formasPago}
    />
  )
}
