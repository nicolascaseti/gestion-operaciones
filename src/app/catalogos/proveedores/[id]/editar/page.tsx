import { prisma } from '@/lib/prisma'
import { ProveedorForm } from '@/components/forms/proveedor-form'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarProveedorPage({ params }: Props) {
  const { id } = await params
  const proveedor = await prisma.supplier.findUnique({
    where: { id: parseInt(id) },
  })

  if (!proveedor) {
    notFound()
  }

  return <ProveedorForm proveedor={proveedor} />
}
