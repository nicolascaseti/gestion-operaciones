import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DeleteButton } from './delete-button'

export const dynamic = 'force-dynamic'

export default async function ProveedoresPage() {
  const proveedores = await prisma.supplier.findMany({
    orderBy: { nombre: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Lista de Proveedores</h2>
          <p className="text-sm text-gray-500">{proveedores.length} proveedores</p>
        </div>
        <Link href="/catalogos/proveedores/nuevo">
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Contacto</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Telefono</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay proveedores registrados
                </td>
              </tr>
            ) : (
              proveedores.map((proveedor) => (
                <tr key={proveedor.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{proveedor.nombre}</td>
                  <td className="px-4 py-3">{proveedor.contacto || '-'}</td>
                  <td className="px-4 py-3">{proveedor.telefono || '-'}</td>
                  <td className="px-4 py-3">{proveedor.email || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        proveedor.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {proveedor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/catalogos/proveedores/${proveedor.id}/editar`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteButton id={proveedor.id} nombre={proveedor.nombre} />
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
