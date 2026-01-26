'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Receipt, BarChart3, Package } from 'lucide-react'
import { QuickEntryForm } from '@/components/quick-entry/quick-entry-form'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Bienvenido al Sistema de Gestion
        </h2>
        <p className="mt-1 text-dark-300">
          Gestiona tus compras, ventas y operaciones de manera eficiente.
        </p>
      </div>

      {/* Registro Rápido */}
      <QuickEntryForm />

      {/* Accesos Rápidos */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Accesos Rapidos</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/compras">
            <Card className="transition-all hover:border-gold-400/50 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-dark-200">
                  Compras
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-dark-400">
                  Registrar y consultar compras a proveedores
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ventas">
            <Card className="transition-all hover:border-gold-400/50 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-dark-200">
                  Ventas
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                  <Receipt className="h-4 w-4 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-dark-400">
                  Registrar y consultar ventas a clientes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/operaciones">
            <Card className="transition-all hover:border-gold-400/50 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-dark-200">
                  Operaciones
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-dark-400">
                  Vista combinada de compras y ventas
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/catalogos/productos">
            <Card className="transition-all hover:border-gold-400/50 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-dark-200">
                  Productos
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/10">
                  <Package className="h-4 w-4 text-gold-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-dark-400">
                  Gestionar catalogo de productos
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
