import { Cliente } from "./types";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import { generateId } from "./utils";

function dbToCliente(row: Record<string, unknown>): Cliente {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    telefono: (row.telefono as string) ?? "",
    fechaSeguimiento: (row.fecha_seguimiento as string) ?? "",
    creadoEn: row.creado_en as string,
    actualizadoEn: row.actualizado_en as string,
  };
}

function clienteToDb(c: Partial<Cliente>) {
  const row: Record<string, unknown> = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.nombre !== undefined) row.nombre = c.nombre;
  if (c.telefono !== undefined) row.telefono = c.telefono;
  if (c.fechaSeguimiento !== undefined) row.fecha_seguimiento = c.fechaSeguimiento;
  if (c.creadoEn !== undefined) row.creado_en = c.creadoEn;
  if (c.actualizadoEn !== undefined) row.actualizado_en = c.actualizadoEn;
  return row;
}

export async function fetchClientes(): Promise<{ data: Cliente[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("fecha_seguimiento", { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data as Record<string, unknown>[]).map(dbToCliente), error: null };
}

export async function createCliente(
  input: Omit<Cliente, "id" | "creadoEn" | "actualizadoEn">
): Promise<{ data: Cliente | null; error: string | null }> {
  const now = new Date().toISOString();
  const nuevo: Cliente = { ...input, id: generateId(), creadoEn: now, actualizadoEn: now };

  if (!isSupabaseConfigured) return { data: nuevo, error: null };
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("clientes")
    .insert(clienteToDb(nuevo))
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: dbToCliente(data as Record<string, unknown>), error: null };
}

export async function updateCliente(
  id: string,
  fields: Partial<Cliente>
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const supabase = getSupabaseClient()!;
  const { error } = await supabase
    .from("clientes")
    .update(clienteToDb({ ...fields, actualizadoEn: new Date().toISOString() }))
    .eq("id", id);
  return { error: error ? error.message : null };
}

export async function deleteCliente(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const supabase = getSupabaseClient()!;
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  return { error: error ? error.message : null };
}
