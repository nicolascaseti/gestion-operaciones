import { z } from 'zod'

export const compraFilterSchema = z.object({
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  proveedorId: z.coerce.number().optional(),
  productoId: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
})

export const createCompraSchema = z.object({
  fecha: z.string().transform((val) => new Date(val)),
  proveedorId: z.number().positive('Debe seleccionar un proveedor'),
  productoId: z.number().positive('Debe seleccionar un producto'),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  costoUnitario: z.number().positive('El costo debe ser mayor a 0'),
  notas: z.string().optional(),
})

export const updateCompraSchema = createCompraSchema.partial()

export type CompraFilter = z.infer<typeof compraFilterSchema>
export type CreateCompra = z.infer<typeof createCompraSchema>
export type UpdateCompra = z.infer<typeof updateCompraSchema>
