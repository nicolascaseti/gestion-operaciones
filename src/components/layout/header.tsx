'use client'

import { usePathname } from 'next/navigation'

const pageTitles: Record<string, string> = {
  '/': 'Inicio',
  '/dashboard': 'Dashboard Financiero',
  '/compras': 'Compras',
  '/compras/nuevo': 'Nueva Compra',
  '/ventas': 'Ventas',
  '/ventas/nuevo': 'Nueva Venta',
  '/inventario': 'Inventario',
  '/operaciones': 'Operaciones',
  '/catalogos/productos': 'Productos',
  '/catalogos/productos/nuevo': 'Nuevo Producto',
  '/catalogos/proveedores': 'Proveedores',
  '/catalogos/proveedores/nuevo': 'Nuevo Proveedor',
  '/catalogos/clientes': 'Clientes',
  '/catalogos/clientes/nuevo': 'Nuevo Cliente',
  '/catalogos/formas-pago': 'Formas de Pago',
  '/catalogos/formas-pago/nuevo': 'Nueva Forma de Pago',
}

export function Header() {
  const pathname = usePathname()

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname]
    if (pathname.startsWith('/inventario/')) return 'Detalle de Producto'
    if (pathname.includes('/editar')) return 'Editar'
    return 'Gestion de Operaciones'
  }

  return (
    <header className="sticky top-0 z-30 border-b border-dark-600 bg-dark-900/80 backdrop-blur-sm">
      <div className="flex h-14 items-center px-6">
        <h1 className="text-lg font-medium text-white">{getTitle()}</h1>
      </div>
    </header>
  )
}
