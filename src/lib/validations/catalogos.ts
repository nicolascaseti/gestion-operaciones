import { z } from 'zod'

// Productos
export const createProductoSchema = z.object({
  codigo: z.string().min(1, 'El codigo es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  costoDefault: z.number().min(0, 'El costo no puede ser negativo').default(0),
  precioDefault: z.number().min(0, 'El precio no puede ser negativo').default(0),
  activo: z.boolean().default(true),
})

export const updateProductoSchema = createProductoSchema.partial()

// Proveedores
export const createProveedorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  activo: z.boolean().default(true),
})

export const updateProveedorSchema = createProveedorSchema.partial()

// Clientes
export const createClienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  activo: z.boolean().default(true),
})

export const updateClienteSchema = createClienteSchema.partial()

// Formas de Pago
export const createFormaPagoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  activo: z.boolean().default(true),
})

export const updateFormaPagoSchema = createFormaPagoSchema.partial()

// Types
export type CreateProducto = z.infer<typeof createProductoSchema>
export type UpdateProducto = z.infer<typeof updateProductoSchema>
export type CreateProveedor = z.infer<typeof createProveedorSchema>
export type UpdateProveedor = z.infer<typeof updateProveedorSchema>
export type CreateCliente = z.infer<typeof createClienteSchema>
export type UpdateCliente = z.infer<typeof updateClienteSchema>
export type CreateFormaPago = z.infer<typeof createFormaPagoSchema>
export type UpdateFormaPago = z.infer<typeof updateFormaPagoSchema>
