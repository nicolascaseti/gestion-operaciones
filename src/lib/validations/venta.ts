import { z } from 'zod'

export const ventaFilterSchema = z.object({
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  clienteId: z.coerce.number().optional(),
  formaPagoId: z.coerce.number().optional(),
  productoId: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
})

export const createVentaSchema = z.object({
  fecha: z.string().transform((val) => new Date(val)),
  formaPagoId: z.number().positive('Debe seleccionar una forma de pago'),
  clienteId: z.number().positive('Debe seleccionar un cliente'),
  productoId: z.number().positive('Debe seleccionar un producto'),
  unidades: z.number().positive('Las unidades deben ser mayor a 0'),
  precioUnitario: z.number().positive('El precio debe ser mayor a 0'),
  costoAsignado: z.number().min(0, 'El costo no puede ser negativo'),
  notas: z.string().optional(),
})

export const updateVentaSchema = createVentaSchema.partial()

export type VentaFilter = z.infer<typeof ventaFilterSchema>
export type CreateVenta = z.infer<typeof createVentaSchema>
export type UpdateVenta = z.infer<typeof updateVentaSchema>
