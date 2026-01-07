# Guia de Despliegue - Gestion de Operaciones

## Requisitos Previos
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com) (gratis)
- Cuenta en [Supabase](https://supabase.com) (gratis)

---

## Paso 1: Crear Base de Datos en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear cuenta
2. Click en "New Project"
3. Elegir nombre y contrasena segura (GUARDAR LA CONTRASENA)
4. Seleccionar region (preferiblemente cercana a tus usuarios)
5. Esperar a que se cree el proyecto (~2 minutos)

### Obtener URLs de conexion:
1. Ir a **Project Settings** (icono de engranaje)
2. Click en **Database** en el menu lateral
3. Buscar la seccion **Connection string**
4. Copiar los valores:

**Para `DATABASE_URL` (URI con pooling):**
```
postgresql://postgres.[ref]:[TU-CONTRASENA]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Para `DIRECT_URL` (Direct connection):**
```
postgresql://postgres.[ref]:[TU-CONTRASENA]@aws-0-[region].pooler.supabase.com:5432/postgres
```

> Reemplaza `[TU-CONTRASENA]` con la contrasena que elegiste al crear el proyecto.

---

## Paso 2: Subir Codigo a GitHub

1. Crear un nuevo repositorio en GitHub
2. En la terminal, dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

---

## Paso 3: Desplegar en Vercel

1. Ir a [vercel.com](https://vercel.com) y conectar con GitHub
2. Click en "Add New Project"
3. Seleccionar el repositorio que acabas de crear
4. En "Environment Variables", agregar:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | (la URL con pooling de Supabase) |
| `DIRECT_URL` | (la URL directa de Supabase) |

5. Click en "Deploy"
6. Esperar a que termine el build (~3-5 minutos)

---

## Paso 4: Ejecutar Migraciones

Despues del primer deploy, necesitas crear las tablas en la base de datos.

### Opcion A: Desde Vercel CLI (recomendado)

1. Instalar Vercel CLI:
```bash
npm i -g vercel
```

2. Vincular proyecto:
```bash
vercel link
```

3. Obtener variables de entorno:
```bash
vercel env pull .env.local
```

4. Ejecutar migracion:
```bash
npx prisma migrate deploy
```

### Opcion B: Manualmente con DIRECT_URL

1. Crear archivo `.env` local con la DIRECT_URL de Supabase
2. Ejecutar:
```bash
npx prisma migrate deploy
```

---

## Paso 5: Cargar Datos Iniciales (Opcional)

Si tienes datos de prueba o catalogos iniciales:

```bash
npx prisma db seed
```

---

## Acceso desde Cualquier Dispositivo

Una vez desplegado, Vercel te dara una URL tipo:
```
https://tu-proyecto.vercel.app
```

Esta URL es accesible desde:
- Cualquier computadora con internet
- Celulares (funciona como app web)
- Tablets

### Para acceso mas facil en celular:
1. Abrir la URL en Chrome/Safari
2. Click en "Agregar a pantalla de inicio"
3. Se creara un icono como si fuera una app

---

## Solucion de Problemas

### Error: "Can't reach database server"
- Verificar que las URLs de conexion sean correctas
- Verificar que la contrasena no tenga caracteres especiales sin codificar

### Error: "Migration failed"
- Asegurarse de usar DIRECT_URL (puerto 5432) para migraciones
- Verificar que el proyecto de Supabase este activo

### La app no carga estilos
- Hacer un "Redeploy" desde el dashboard de Vercel
- Verificar que no haya errores en el build

---

## Actualizaciones

Para actualizar la app despues de hacer cambios:

```bash
git add .
git commit -m "Descripcion del cambio"
git push
```

Vercel detectara automaticamente el push y re-desplegara la app.

---

## Costos

### Plan Gratuito incluye:
- **Vercel**: 100GB bandwidth, builds ilimitados
- **Supabase**: 500MB base de datos, 2GB transferencia

Para un uso pequeno/mediano, el plan gratuito es suficiente.
