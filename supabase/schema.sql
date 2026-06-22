-- ============================================================
-- SERVA Cotizaciones — Schema
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ============================================================

create table if not exists cotizaciones (
  id                   text primary key,
  numero_cotizacion    text        not null,
  nombre_servicio      text        not null,
  cliente              text        not null,
  proveedor            text        not null,
  monto                numeric     not null default 0,
  fecha_solicitud      text        not null default '',
  fecha_envio          text        not null default '',
  fecha_cierre_estimada text       not null default '',
  responsable          text        not null,
  estado               text        not null check (estado in ('pendiente','enviada','aprobada','rechazada')),
  proxima_accion       text        not null default '',
  notas                text        not null default '',
  enlace_sheets        text        not null default '',
  categoria            text        not null,
  prioridad            text        not null check (prioridad in ('Alta','Media','Baja')),
  probabilidad_cierre  integer     not null default 50,
  motivo_rechazo       text        not null default '',
  creado_en            timestamptz not null default now(),
  actualizado_en       timestamptz not null default now()
);

-- Habilitar Row Level Security (ajusta las policies según tus necesidades)
alter table cotizaciones enable row level security;

-- Policy: permitir todo a usuarios autenticados (ajusta según tu setup de auth)
create policy "Acceso total para autenticados"
  on cotizaciones
  for all
  to authenticated
  using (true)
  with check (true);

-- Policy: permitir todo con anon key (para proyectos sin autenticación)
-- Descomenta si no usas auth y usas solo la anon key:
create policy "Acceso total anon"
  on cotizaciones
  for all
  to anon
  using (true)
  with check (true);
