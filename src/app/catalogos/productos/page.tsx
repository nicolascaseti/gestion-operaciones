import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DeleteButton } from './delete-button'

export const dynamic = 'force-dynamic'

export default async function ProductosPage() {
  const productos = await prisma.product.findMany({
    orderBy: { nombre: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Lista de Productos</h2>
          <p className="text-sm text-gray-500">{productos.length} productos</p>
        </div>
        <Link href="/catalogos/productos/nuevo">
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Codigo</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Costo</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Precio</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{producto.codigo}</td>
                  <td className="px-4 py-3">{producto.nombre}</td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(producto.costoDefault.toString())}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(producto.precioDefault.toString())}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        producto.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/catalogos/productos/${producto.id}/editar`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteButton id={producto.id} nombre={producto.nombre} />
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
