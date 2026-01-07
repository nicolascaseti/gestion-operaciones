import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Receipt, BarChart3, Package } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Bienvenido al Sistema de Gestion
        </h2>
        <p className="mt-1 text-gray-600">
          Gestiona tus compras, ventas y operaciones de manera eficiente.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/compras">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Compras
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Registrar y consultar compras a proveedores
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ventas">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ventas
              </CardTitle>
              <Receipt className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Registrar y consultar ventas a clientes
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/operaciones">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Operaciones
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Vista combinada de compras y ventas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/catalogos/productos">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Productos
              </CardTitle>
              <Package className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Gestionar catalogo de productos
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
