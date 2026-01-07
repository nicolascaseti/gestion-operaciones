import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Crear Formas de Pago
  const formasPago = await Promise.all([
    prisma.paymentMethod.create({ data: { nombre: 'Efectivo' } }),
    prisma.paymentMethod.create({ data: { nombre: 'Transferencia' } }),
    prisma.paymentMethod.create({ data: { nombre: 'Tarjeta de Debito' } }),
    prisma.paymentMethod.create({ data: { nombre: 'Tarjeta de Credito' } }),
    prisma.paymentMethod.create({ data: { nombre: 'Mercado Pago' } }),
  ])
  console.log(`Created ${formasPago.length} payment methods`)

  // Crear Proveedores
  const proveedores = await Promise.all([
    prisma.supplier.create({
      data: {
        nombre: 'Distribuidora Norte',
        contacto: 'Juan Perez',
        telefono: '11-4567-8901',
        email: 'ventas@distnorte.com',
      },
    }),
    prisma.supplier.create({
      data: {
        nombre: 'Mayorista Central',
        contacto: 'Maria Garcia',
        telefono: '11-2345-6789',
        email: 'contacto@mayoristacentral.com',
      },
    }),
    prisma.supplier.create({
      data: {
        nombre: 'Importadora Sur',
        contacto: 'Carlos Lopez',
        telefono: '11-9876-5432',
        email: 'info@impsur.com',
      },
    }),
  ])
  console.log(`Created ${proveedores.length} suppliers`)

  // Crear Clientes
  const clientes = await Promise.all([
    prisma.customer.create({
      data: {
        nombre: 'Consumidor Final',
        contacto: '',
        telefono: '',
        email: '',
      },
    }),
    prisma.customer.create({
      data: {
        nombre: 'Kiosco El Sol',
        contacto: 'Roberto Martinez',
        telefono: '11-5555-1234',
        email: 'kioscoelsol@gmail.com',
      },
    }),
    prisma.customer.create({
      data: {
        nombre: 'Minimercado La Esquina',
        contacto: 'Ana Fernandez',
        telefono: '11-6666-4321',
        email: 'minimercadolaesquina@gmail.com',
      },
    }),
  ])
  console.log(`Created ${clientes.length} customers`)

  // Crear Productos
  const productos = await Promise.all([
    prisma.product.create({
      data: {
        codigo: 'PROD-001',
        nombre: 'Galletitas Dulces x 200g',
        costoDefault: 450,
        precioDefault: 750,
      },
    }),
    prisma.product.create({
      data: {
        codigo: 'PROD-002',
        nombre: 'Aceite Girasol x 1.5L',
        costoDefault: 1200,
        precioDefault: 1800,
      },
    }),
    prisma.product.create({
      data: {
        codigo: 'PROD-003',
        nombre: 'Arroz Largo Fino x 1kg',
        costoDefault: 650,
        precioDefault: 950,
      },
    }),
    prisma.product.create({
      data: {
        codigo: 'PROD-004',
        nombre: 'Fideos Spaghetti x 500g',
        costoDefault: 380,
        precioDefault: 580,
      },
    }),
    prisma.product.create({
      data: {
        codigo: 'PROD-005',
        nombre: 'Leche Entera x 1L',
        costoDefault: 520,
        precioDefault: 780,
      },
    }),
  ])
  console.log(`Created ${productos.length} products`)

  // Crear algunas Compras de ejemplo
  const compras = await Promise.all([
    prisma.purchase.create({
      data: {
        fecha: new Date('2024-01-15'),
        proveedorId: proveedores[0].id,
        productoId: productos[0].id,
        codigoProducto: productos[0].codigo,
        nombreProducto: productos[0].nombre,
        cantidad: 50,
        costoUnitario: 420,
        costoTotal: 21000,
        notas: 'Compra inicial de stock',
      },
    }),
    prisma.purchase.create({
      data: {
        fecha: new Date('2024-01-18'),
        proveedorId: proveedores[1].id,
        productoId: productos[1].id,
        codigoProducto: productos[1].codigo,
        nombreProducto: productos[1].nombre,
        cantidad: 30,
        costoUnitario: 1150,
        costoTotal: 34500,
        notas: '',
      },
    }),
    prisma.purchase.create({
      data: {
        fecha: new Date('2024-01-20'),
        proveedorId: proveedores[0].id,
        productoId: productos[2].id,
        codigoProducto: productos[2].codigo,
        nombreProducto: productos[2].nombre,
        cantidad: 40,
        costoUnitario: 620,
        costoTotal: 24800,
        notas: 'Promocion por cantidad',
      },
    }),
  ])
  console.log(`Created ${compras.length} purchases`)

  // Crear algunas Ventas de ejemplo
  const ventas = await Promise.all([
    prisma.sale.create({
      data: {
        fecha: new Date('2024-01-16'),
        formaPagoId: formasPago[0].id, // Efectivo
        clienteId: clientes[0].id, // Consumidor Final
        productoId: productos[0].id,
        codigoProducto: productos[0].codigo,
        nombreProducto: productos[0].nombre,
        unidades: 5,
        precioUnitario: 750,
        ventaTotal: 3750,
        costoAsignado: 2100,
        ganancia: 1650,
        margenPorcentaje: 44,
        notas: '',
      },
    }),
    prisma.sale.create({
      data: {
        fecha: new Date('2024-01-17'),
        formaPagoId: formasPago[1].id, // Transferencia
        clienteId: clientes[1].id, // Kiosco El Sol
        productoId: productos[1].id,
        codigoProducto: productos[1].codigo,
        nombreProducto: productos[1].nombre,
        unidades: 10,
        precioUnitario: 1750,
        ventaTotal: 17500,
        costoAsignado: 11500,
        ganancia: 6000,
        margenPorcentaje: 34.29,
        notas: 'Venta mayorista con descuento',
      },
    }),
    prisma.sale.create({
      data: {
        fecha: new Date('2024-01-19'),
        formaPagoId: formasPago[4].id, // Mercado Pago
        clienteId: clientes[0].id, // Consumidor Final
        productoId: productos[2].id,
        codigoProducto: productos[2].codigo,
        nombreProducto: productos[2].nombre,
        unidades: 3,
        precioUnitario: 950,
        ventaTotal: 2850,
        costoAsignado: 1860,
        ganancia: 990,
        margenPorcentaje: 34.74,
        notas: '',
      },
    }),
  ])
  console.log(`Created ${ventas.length} sales`)

  console.log('Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
