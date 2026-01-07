import { prisma } from '@/lib/prisma'
import { FormaPagoForm } from '@/components/forms/forma-pago-form'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarFormaPagoPage({ params }: Props) {
  const { id } = await params
  const formaPago = await prisma.paymentMethod.findUnique({
    where: { id: parseInt(id) },
  })

  if (!formaPago) {
    notFound()
  }

  return <FormaPagoForm formaPago={formaPago} />
}
