import { Cotizacion, EstadoCotizacion } from "./types";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import { generateId, generateNumeroCotizacion } from "./utils";
import { cotizacionesEjemplo } from "./data";

// ── Mappers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbToCotizacion(row: any): Cotizacion {
  return {
    id: row.id,
    numeroCotizacion: row.numero_cotizacion,
    nombreServicio: row.nombre_servicio,
    cliente: row.cliente,
    proveedor: row.proveedor,
    monto: Number(row.monto),
    fechaSolicitud: row.fecha_solicitud ?? "",
    fechaEnvio: row.fecha_envio ?? "",
    fechaCierreEstimada: row.fecha_cierre_estimada ?? "",
    responsable: row.responsable,
    estado: row.estado as EstadoCotizacion,
    proximaAccion: row.proxima_accion ?? "",
    notas: row.notas ?? "",
    enlaceSheets: row.enlace_sheets ?? "",
    categoria: row.categoria,
    prioridad: row.prioridad as "Alta" | "Media" | "Baja",
    probabilidadCierre: Number(row.probabilidad_cierre),
    motivoRechazo: row.motivo_rechazo ?? "",
    creadoEn: row.creado_en,
    actualizadoEn: row.actualizado_en,
  };
}

function cotizacionToDb(c: Partial<Cotizacion> & { id?: string }) {
  const row: Record<string, unknown> = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.numeroCotizacion !== undefined) row.numero_cotizacion = c.numeroCotizacion;
  if (c.nombreServicio !== undefined) row.nombre_servicio = c.nombreServicio;
  if (c.cliente !== undefined) row.cliente = c.cliente;
  if (c.proveedor !== undefined) row.proveedor = c.proveedor;
  if (c.monto !== undefined) row.monto = c.monto;
  if (c.fechaSolicitud !== undefined) row.fecha_solicitud = c.fechaSolicitud;
  if (c.fechaEnvio !== undefined) row.fecha_envio = c.fechaEnvio;
  if (c.fechaCierreEstimada !== undefined) row.fecha_cierre_estimada = c.fechaCierreEstimada;
  if (c.responsable !== undefined) row.responsable = c.responsable;
  if (c.estado !== undefined) row.estado = c.estado;
  if (c.proximaAccion !== undefined) row.proxima_accion = c.proximaAccion;
  if (c.notas !== undefined) row.notas = c.notas;
  if (c.enlaceSheets !== undefined) row.enlace_sheets = c.enlaceSheets;
  if (c.categoria !== undefined) row.categoria = c.categoria;
  if (c.prioridad !== undefined) row.prioridad = c.prioridad;
  if (c.probabilidadCierre !== undefined) row.probabilidad_cierre = c.probabilidadCierre;
  if (c.motivoRechazo !== undefined) row.motivo_rechazo = c.motivoRechazo;
  if (c.creadoEn !== undefined) row.creado_en = c.creadoEn;
  if (c.actualizadoEn !== undefined) row.actualizado_en = c.actualizadoEn;
  return row;
}

// ── Service functions ─────────────────────────────────────────────────────────

/** Carga todas las cotizaciones. Si Supabase no está configurado, retorna datos de ejemplo. */
export async function fetchCotizaciones(): Promise<{ data: Cotizacion[]; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { data: cotizacionesEjemplo, error: null };
  }
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) return { data: [], error: error.message };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { data: (data as any[]).map(dbToCotizacion), error: null };
}

/** Crea una nueva cotización en Supabase y la retorna con id y número generados. */
export async function createCotizacion(
  input: Omit<Cotizacion, "id" | "numeroCotizacion" | "creadoEn" | "actualizadoEn">,
  totalActual: number
): Promise<{ data: Cotizacion | null; error: string | null }> {
  const now = new Date().toISOString();
  const nueva: Cotizacion = {
    ...input,
    id: generateId(),
    numeroCotizacion: generateNumeroCotizacion(totalActual),
    creadoEn: now,
    actualizadoEn: now,
  };

  if (!isSupabaseConfigured) {
    return { data: nueva, error: null };
  }

  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("cotizaciones")
    .insert(cotizacionToDb(nueva))
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { data: dbToCotizacion(data as any), error: null };
}

/** Actualiza campos de una cotización existente. */
export async function updateCotizacion(
  id: string,
  fields: Partial<Cotizacion>
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const supabase = getSupabaseClient()!;
  const row = cotizacionToDb({ ...fields, actualizadoEn: new Date().toISOString() });
  const { error } = await supabase
    .from("cotizaciones")
    .update(row)
    .eq("id", id);

  return { error: error ? error.message : null };
}

/** Elimina una cotización por id. */
export async function deleteCotizacion(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const supabase = getSupabaseClient()!;
  const { error } = await supabase.from("cotizaciones").delete().eq("id", id);
  return { error: error ? error.message : null };
}

/** Cambia el estado (columna Kanban) de una cotización. */
export async function moverEstado(
  id: string,
  nuevoEstado: EstadoCotizacion
): Promise<{ error: string | null }> {
  return updateCotizacion(id, { estado: nuevoEstado });
}
