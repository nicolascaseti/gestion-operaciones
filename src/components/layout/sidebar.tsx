'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  ShoppingCart,
  Receipt,
  BarChart3,
  Package,
  Users,
  Truck,
  CreditCard,
  ChevronDown,
  LayoutDashboard,
  Warehouse,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Compras', href: '/compras', icon: ShoppingCart },
  { name: 'Ventas', href: '/ventas', icon: Receipt },
  { name: 'Inventario', href: '/inventario', icon: Warehouse },
  { name: 'Operaciones', href: '/operaciones', icon: BarChart3 },
]

const catalogos = [
  { name: 'Productos', href: '/catalogos/productos', icon: Package },
  { name: 'Proveedores', href: '/catalogos/proveedores', icon: Truck },
  { name: 'Clientes', href: '/catalogos/clientes', icon: Users },
  { name: 'Formas de Pago', href: '/catalogos/formas-pago', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const [catalogosOpen, setCatalogosOpen] = useState(
    pathname.startsWith('/catalogos')
  )

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-dark-600 bg-dark-900">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-dark-600 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/10">
              <BarChart3 className="h-5 w-5 text-gold-400" />
            </div>
            <span className="text-lg font-semibold text-white">Gestion</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gold-400/10 text-gold-400'
                    : 'text-dark-200 hover:bg-dark-700 hover:text-white'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-gold-400')} />
                {item.name}
              </Link>
            )
          })}

          {/* Catalogos Section */}
          <div className="pt-4">
            <button
              onClick={() => setCatalogosOpen(!catalogosOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-dark-200 hover:bg-dark-700 hover:text-white transition-all duration-200"
            >
              <span>Catalogos</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  catalogosOpen && 'rotate-180'
                )}
              />
            </button>

            {catalogosOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-dark-600 pl-3">
                {catalogos.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-gold-400/10 text-gold-400'
                          : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                      )}
                    >
                      <item.icon className={cn('h-4 w-4', isActive && 'text-gold-400')} />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-dark-600 p-4">
          <div className="rounded-lg bg-dark-800 p-3">
            <p className="text-xs text-dark-400">Version 1.0.0</p>
            <p className="text-xs text-dark-500">Sistema de Gestion</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
