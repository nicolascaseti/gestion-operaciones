import { prisma } from '@/lib/prisma'
import { CompraForm } from '@/components/forms/compra-form'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarCompraPage({ params }: Props) {
  const { id } = await params

  const [compra, productos, proveedores] = await Promise.all([
    prisma.purchase.findUnique({
      where: { id: parseInt(id) },
    }),
    prisma.product.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.supplier.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    }),
  ])

  if (!compra) {
    notFound()
  }

  const compraForForm = {
    id: compra.id,
    fecha: compra.fecha.toISOString(),
    proveedorId: compra.proveedorId,
    productoId: compra.productoId,
    cantidad: compra.cantidad.toString(),
    costoUnitario: compra.costoUnitario.toString(),
    notas: compra.notas,
  }

  const productosForForm = productos.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    costoDefault: p.costoDefault.toString(),
  }))

  return (
    <CompraForm
      compra={compraForForm}
      productos={productosForForm}
      proveedores={proveedores}
    />
  )
}
