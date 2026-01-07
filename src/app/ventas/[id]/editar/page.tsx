import { prisma } from '@/lib/prisma'
import { VentaForm } from '@/components/forms/venta-form'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarVentaPage({ params }: Props) {
  const { id } = await params

  const [venta, productos, clientes, formasPago] = await Promise.all([
    prisma.sale.findUnique({
      where: { id: parseInt(id) },
    }),
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

  if (!venta) {
    notFound()
  }

  const ventaForForm = {
    id: venta.id,
    fecha: venta.fecha.toISOString(),
    clienteId: venta.clienteId,
    formaPagoId: venta.formaPagoId,
    productoId: venta.productoId,
    unidades: venta.unidades.toString(),
    precioUnitario: venta.precioUnitario.toString(),
    costoAsignado: venta.costoAsignado.toString(),
    notas: venta.notas,
  }

  const productosForForm = productos.map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    costoDefault: p.costoDefault.toString(),
    precioDefault: p.precioDefault.toString(),
  }))

  return (
    <VentaForm
      venta={ventaForForm}
      productos={productosForForm}
      clientes={clientes}
      formasPago={formasPago}
    />
  )
}
