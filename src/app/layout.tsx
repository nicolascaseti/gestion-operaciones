import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestion de Operaciones',
  description: 'Sistema de gestion de compras y ventas',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="bg-dark-800 text-white antialiased">
        <Providers>
          <Sidebar />
          <div className="ml-64 min-h-screen">
            <Header />
            <main className="p-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
