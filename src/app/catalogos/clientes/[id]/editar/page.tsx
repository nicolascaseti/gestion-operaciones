import { prisma } from '@/lib/prisma'
import { ClienteForm } from '@/components/forms/cliente-form'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params
  const cliente = await prisma.customer.findUnique({
    where: { id: parseInt(id) },
  })

  if (!cliente) {
    notFound()
  }

  return <ClienteForm cliente={cliente} />
}
