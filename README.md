# Sistema de Gestion de Operaciones

Sistema de gestion de compras y ventas con exportacion a Excel.

## Requisitos Previos

- [Node.js](https://nodejs.org/) version 18 o superior
- npm (viene incluido con Node.js)

## Instalacion

1. **Instalar Node.js**

   Descargar e instalar desde: https://nodejs.org/

2. **Instalar dependencias del proyecto**

   Abrir una terminal en la carpeta `gestion-operaciones` y ejecutar:

   ```bash
   npm install
   ```

3. **Configurar la base de datos**

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Cargar datos de ejemplo (opcional)**

   ```bash
   npm run db:seed
   ```

5. **Iniciar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**

   Ir a: http://localhost:3000

## Estructura del Proyecto

```
gestion-operaciones/
├── prisma/
│   ├── schema.prisma    # Esquema de base de datos
│   └── seed.ts          # Datos de prueba
├── src/
│   ├── app/             # Paginas y APIs (Next.js App Router)
│   │   ├── api/         # Endpoints de API
│   │   ├── compras/     # Paginas de compras
│   │   ├── ventas/      # Paginas de ventas
│   │   ├── operaciones/ # Vista combinada
│   │   └── catalogos/   # Gestion de catalogos
│   ├── components/      # Componentes reutilizables
│   ├── lib/             # Utilidades y configuraciones
│   └── hooks/           # React hooks personalizados
```

## Funcionalidades

### Catalogos (Datos Maestros)
- Productos (codigo, nombre, costo, precio)
- Proveedores
- Clientes
- Formas de Pago

### Compras
- Registro de compras a proveedores
- Filtros por fecha, proveedor, producto
- Exportacion a Excel

### Ventas
- Registro de ventas a clientes
- Calculo automatico de ganancia y margen
- Filtros por fecha, cliente, forma de pago, producto
- Exportacion a Excel

### Operaciones
- Vista combinada de compras y ventas
- Resumen con totales
- Exportacion a Excel (libro con 2 hojas)

## Endpoints de Exportacion Excel

| Endpoint | Descripcion |
|----------|-------------|
| `GET /api/exports/purchases.xlsx` | Exporta compras |
| `GET /api/exports/sales.xlsx` | Exporta ventas |
| `GET /api/exports/operations.xlsx` | Exporta compras y ventas (2 hojas) |

### Parametros de filtro (query params)

- `fechaDesde`: Fecha inicial (YYYY-MM-DD)
- `fechaHasta`: Fecha final (YYYY-MM-DD)
- `proveedorId`: ID del proveedor (solo compras)
- `clienteId`: ID del cliente (solo ventas)
- `formaPagoId`: ID de forma de pago (solo ventas)
- `productoId`: ID del producto

## Formato del Excel Exportado

- Encabezados en negrita con fondo azul
- Primera fila congelada
- Columnas con ancho automatico
- Moneda en formato ARS ($#,##0.00)
- Fechas en formato dd/mm/yyyy
- Ganancias en verde (positivas) o rojo (negativas)

## Scripts Disponibles

```bash
npm run dev       # Iniciar en modo desarrollo
npm run build     # Compilar para produccion
npm run start     # Iniciar servidor de produccion
npm run lint      # Ejecutar linter
npm run db:migrate # Ejecutar migraciones de Prisma
npm run db:seed   # Cargar datos de prueba
npm run db:studio # Abrir Prisma Studio (interfaz visual de BD)
```

## Tecnologias Utilizadas

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estatico
- **Prisma** - ORM para base de datos
- **SQLite** - Base de datos local
- **Tailwind CSS** - Estilos
- **ExcelJS** - Generacion de archivos Excel
- **Zod** - Validacion de datos
- **TanStack Table** - Tablas de datos
- **Lucide React** - Iconos
