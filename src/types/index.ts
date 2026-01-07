export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  pagination?: PaginationInfo
}

export interface ApiError {
  error: string
  details?: unknown
}

export interface FilterOption {
  value: string
  label: string
}

// Re-export Prisma types
export type {
  Product,
  Supplier,
  Customer,
  PaymentMethod,
  Purchase,
  Sale,
} from '@prisma/client'

// Extended types with relations
export interface PurchaseWithRelations {
  id: number
  fecha: Date
  proveedorId: number
  productoId: number
  codigoProducto: string
  nombreProducto: string
  cantidad: number | string
  costoUnitario: number | string
  costoTotal: number | string
  notas: string | null
  createdAt: Date
  updatedAt: Date
  proveedor: {
    id: number
    nombre: string
  }
  producto: {
    id: number
    codigo: string
    nombre: string
  }
}

export interface SaleWithRelations {
  id: number
  fecha: Date
  formaPagoId: number
  clienteId: number
  productoId: number
  codigoProducto: string
  nombreProducto: string
  unidades: number | string
  precioUnitario: number | string
  ventaTotal: number | string
  costoAsignado: number | string
  ganancia: number | string
  margenPorcentaje: number | string
  notas: string | null
  createdAt: Date
  updatedAt: Date
  formaPago: {
    id: number
    nombre: string
  }
  cliente: {
    id: number
    nombre: string
  }
  producto: {
    id: number
    codigo: string
    nombre: string
  }
}
