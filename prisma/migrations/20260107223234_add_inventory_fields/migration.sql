-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_productos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT,
    "descripcion" TEXT,
    "imagen" TEXT,
    "costo_default" DECIMAL NOT NULL DEFAULT 0,
    "precio_default" DECIMAL NOT NULL DEFAULT 0,
    "stock_inicial" DECIMAL NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_productos" ("activo", "codigo", "costo_default", "created_at", "id", "nombre", "precio_default", "updated_at") SELECT "activo", "codigo", "costo_default", "created_at", "id", "nombre", "precio_default", "updated_at" FROM "productos";
DROP TABLE "productos";
ALTER TABLE "new_productos" RENAME TO "productos";
CREATE UNIQUE INDEX "productos_codigo_key" ON "productos"("codigo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
