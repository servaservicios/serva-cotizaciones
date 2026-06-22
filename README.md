# SERVA Cotizaciones

Plataforma interna de gestión de cotizaciones de SERVA. Incluye vistas Kanban, tabla y dashboard ejecutivo.

## Stack

- **Next.js 14** (App Router)
- **Zustand** (estado global en cliente)
- **Supabase** (base de datos y persistencia multi-dispositivo)
- **@dnd-kit** (drag & drop en Kanban)
- **Tailwind CSS**

---

## Configuración de Supabase

### 1. Crear el proyecto en Supabase

Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto.

### 2. Crear la tabla

En el **SQL Editor** de tu proyecto Supabase, ejecuta el contenido de:

```
supabase/schema.sql
```

Esto crea la tabla `cotizaciones` con todos los campos y las Row Level Security policies básicas.

### 3. Cargar datos de ejemplo (opcional)

Si quieres partir con datos de muestra, ejecuta también:

```
supabase/seed.sql
```

### 4. Variables de entorno

Copia el archivo de plantilla:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` y reemplaza con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

Puedes encontrar estos valores en tu proyecto Supabase en:
**Settings → API → Project URL** y **Project API Keys → anon public**

> **Nota:** Las variables deben tener el prefijo `NEXT_PUBLIC_` para que Next.js las exponga al cliente (navegador). Si usas Vercel u otro hosting, agrégalas también en las variables de entorno del proyecto.

### 5. Iniciar el servidor

```bash
npm install
npm run dev
```

---

## Modo sin Supabase

Si no configuras las variables de entorno, la aplicación funciona en **modo local** con datos de ejemplo (sin persistencia entre sesiones). Un banner informativo lo indica en la parte superior de la pantalla.

---

## Estructura de la base de datos

### Tabla: `cotizaciones`

| Columna               | Tipo        | Descripción                          |
|-----------------------|-------------|--------------------------------------|
| `id`                  | text (PK)   | Identificador único                  |
| `numero_cotizacion`   | text        | Ej: COT-2025-001                     |
| `nombre_servicio`     | text        | Nombre del servicio cotizado         |
| `cliente`             | text        | Nombre/razón social del cliente      |
| `proveedor`           | text        | Proveedor asignado                   |
| `monto`               | numeric     | Monto sin IVA en MXN                 |
| `fecha_solicitud`     | text        | Fecha de solicitud (YYYY-MM-DD)      |
| `fecha_envio`         | text        | Fecha de envío de cotización         |
| `fecha_cierre_estimada` | text      | Fecha estimada de cierre             |
| `responsable`         | text        | Responsable interno                  |
| `estado`              | text        | pendiente / enviada / aprobada / rechazada |
| `proxima_accion`      | text        | Nota de seguimiento                  |
| `notas`               | text        | Notas internas                       |
| `enlace_sheets`       | text        | URL a Google Sheets                  |
| `categoria`           | text        | Categoría del servicio               |
| `prioridad`           | text        | Alta / Media / Baja                  |
| `probabilidad_cierre` | integer     | 0–100                                |
| `motivo_rechazo`      | text        | Razón de rechazo (si aplica)         |
| `creado_en`           | timestamptz | Timestamp de creación                |
| `actualizado_en`      | timestamptz | Timestamp de última actualización    |

---

## Despliegue en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Agrega las variables de entorno en **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Despliega

Los cambios hechos desde cualquier dispositivo quedan sincronizados automáticamente en Supabase.
