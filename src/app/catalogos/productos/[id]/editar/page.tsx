import { prisma } from '@/lib/prisma'
import { ProductoForm } from '@/components/forms/producto-form'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params
  const producto = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  })

  if (!producto) {
    notFound()
  }

  return <ProductoForm producto={producto} />
}
