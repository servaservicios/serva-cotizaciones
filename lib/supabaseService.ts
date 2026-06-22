import { Cotizacion, EstadoCotizacion } from "./types";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import { generateId, generateNumeroCotizacion } from "./utils";
import { cotizacionesEjemplo } from "./data";

// ── Mappers ──────────────────────────────────────────────────────────────────

export function dbToCotizacion(row: Record<string, unknown>): Cotizacion {
  return {
    id: row.id as string,
    numeroCotizacion: row.numero_cotizacion as string,
    nombreServicio: row.nombre_servicio as string,
    cliente: row.cliente as string,
    proveedor: row.proveedor as string,
    monto: Number(row.monto),
    fechaSolicitud: (row.fecha_solicitud as string) ?? "",
    fechaEnvio: (row.fecha_envio as string) ?? "",
    fechaCierreEstimada: (row.fecha_cierre_estimada as string) ?? "",
    responsable: row.responsable as string,
    estado: row.estado as EstadoCotizacion,
    proximaAccion: (row.proxima_accion as string) ?? "",
    notas: (row.notas as string) ?? "",
    enlaceSheets: (row.enlace_sheets as string) ?? "",
    categoria: row.categoria as string,
    prioridad: row.prioridad as "Alta" | "Media" | "Baja",
    probabilidadCierre: Number(row.probabilidad_cierre),
    motivoRechazo: (row.motivo_rechazo as string) ?? "",
    creadoEn: row.creado_en as string,
    actualizadoEn: row.actualizado_en as string,
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
  return { data: (data as Record<string, unknown>[]).map(dbToCotizacion), error: null };
}

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
  return { data: dbToCotizacion(data as Record<string, unknown>), error: null };
}

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

export async function deleteCotizacion(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const supabase = getSupabaseClient()!;
  const { error } = await supabase.from("cotizaciones").delete().eq("id", id);
  return { error: error ? error.message : null };
}

export async function moverEstado(
  id: string,
  nuevoEstado: EstadoCotizacion
): Promise<{ error: string | null }> {
  return updateCotizacion(id, { estado: nuevoEstado });
}
