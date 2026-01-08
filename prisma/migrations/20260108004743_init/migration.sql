-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT,
    "descripcion" TEXT,
    "imagen" TEXT,
    "costo_default" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "precio_default" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "stock_inicial" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formas_pago" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formas_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "proveedor_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "codigo_producto" TEXT NOT NULL,
    "nombre_producto" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "costo_unitario" DECIMAL(65,30) NOT NULL,
    "costo_total" DECIMAL(65,30) NOT NULL,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "forma_pago_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "codigo_producto" TEXT NOT NULL,
    "nombre_producto" TEXT NOT NULL,
    "unidades" DECIMAL(65,30) NOT NULL,
    "precio_unitario" DECIMAL(65,30) NOT NULL,
    "venta_total" DECIMAL(65,30) NOT NULL,
    "costo_asignado" DECIMAL(65,30) NOT NULL,
    "ganancia" DECIMAL(65,30) NOT NULL,
    "margen_porcentaje" DECIMAL(65,30) NOT NULL,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_key" ON "productos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "formas_pago_nombre_key" ON "formas_pago"("nombre");

-- CreateIndex
CREATE INDEX "compras_fecha_idx" ON "compras"("fecha");

-- CreateIndex
CREATE INDEX "compras_proveedor_id_idx" ON "compras"("proveedor_id");

-- CreateIndex
CREATE INDEX "compras_producto_id_idx" ON "compras"("producto_id");

-- CreateIndex
CREATE INDEX "ventas_fecha_idx" ON "ventas"("fecha");

-- CreateIndex
CREATE INDEX "ventas_cliente_id_idx" ON "ventas"("cliente_id");

-- CreateIndex
CREATE INDEX "ventas_forma_pago_id_idx" ON "ventas"("forma_pago_id");

-- CreateIndex
CREATE INDEX "ventas_producto_id_idx" ON "ventas"("producto_id");

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_forma_pago_id_fkey" FOREIGN KEY ("forma_pago_id") REFERENCES "formas_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
