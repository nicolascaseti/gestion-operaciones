import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DeleteButton } from './delete-button'

export const dynamic = 'force-dynamic'

export default async function FormasPagoPage() {
  const formasPago = await prisma.paymentMethod.findMany({
    orderBy: { nombre: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Formas de Pago</h2>
          <p className="text-sm text-gray-500">{formasPago.length} formas de pago</p>
        </div>
        <Link href="/catalogos/formas-pago/nuevo">
          <Button>
            <Plus className="h-4 w-4" />
            Nueva Forma de Pago
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {formasPago.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No hay formas de pago registradas
                </td>
              </tr>
            ) : (
              formasPago.map((formaPago) => (
                <tr key={formaPago.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{formaPago.nombre}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        formaPago.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {formaPago.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/catalogos/formas-pago/${formaPago.id}/editar`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteButton id={formaPago.id} nombre={formaPago.nombre} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
