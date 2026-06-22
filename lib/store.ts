import { create } from "zustand";
import { Cotizacion, EstadoCotizacion } from "./types";
import {
  fetchCotizaciones as sbFetch,
  createCotizacion as sbCreate,
  updateCotizacion as sbUpdate,
  deleteCotizacion as sbDelete,
  moverEstado as sbMover,
  dbToCotizacion,
} from "./supabaseService";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type RealtimeStatus = "connected" | "connecting" | "disconnected";

interface CotizacionStore {
  cotizaciones: Cotizacion[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  realtimeStatus: RealtimeStatus;

  fetchCotizaciones: () => Promise<void>;
  addCotizacion: (
    data: Omit<Cotizacion, "id" | "numeroCotizacion" | "creadoEn" | "actualizadoEn">
  ) => Promise<{ error: string | null }>;
  updateCotizacion: (id: string, data: Partial<Cotizacion>) => Promise<{ error: string | null }>;
  deleteCotizacion: (id: string) => Promise<{ error: string | null }>;
  moverEstado: (id: string, nuevoEstado: EstadoCotizacion) => Promise<void>;
  clearError: () => void;
  subscribeToRealtime: () => () => void;
}

export const useCotizacionStore = create<CotizacionStore>((set, get) => ({
  cotizaciones: [],
  loading: false,
  error: null,
  initialized: false,
  realtimeStatus: "disconnected",

  clearError: () => set({ error: null }),

  fetchCotizaciones: async () => {
    set({ loading: true, error: null });
    const { data, error } = await sbFetch();
    if (error) {
      set({ loading: false, error: `Error al cargar cotizaciones: ${error}` });
      return;
    }
    set({ cotizaciones: data, loading: false, initialized: true });
  },

  addCotizacion: async (input) => {
    const { cotizaciones } = get();
    const { data, error } = await sbCreate(input, cotizaciones.length);
    if (error) {
      set({ error: `Error al guardar: ${error}` });
      return { error };
    }
    if (data) {
      set({ cotizaciones: [data, ...cotizaciones] });
    }
    return { error: null };
  },

  updateCotizacion: async (id, fields) => {
    set((state) => ({
      cotizaciones: state.cotizaciones.map((c) =>
        c.id === id ? { ...c, ...fields, actualizadoEn: new Date().toISOString() } : c
      ),
    }));
    const { error } = await sbUpdate(id, fields);
    if (error) {
      set({ error: `Error al actualizar: ${error}` });
      if (isSupabaseConfigured) get().fetchCotizaciones();
      return { error };
    }
    return { error: null };
  },

  deleteCotizacion: async (id) => {
    set((state) => ({
      cotizaciones: state.cotizaciones.filter((c) => c.id !== id),
    }));
    const { error } = await sbDelete(id);
    if (error) {
      set({ error: `Error al eliminar: ${error}` });
      if (isSupabaseConfigured) get().fetchCotizaciones();
      return { error };
    }
    return { error: null };
  },

  moverEstado: async (id, nuevoEstado) => {
    set((state) => ({
      cotizaciones: state.cotizaciones.map((c) =>
        c.id === id ? { ...c, estado: nuevoEstado, actualizadoEn: new Date().toISOString() } : c
      ),
    }));
    const { error } = await sbMover(id, nuevoEstado);
    if (error) {
      set({ error: `Error al mover cotización: ${error}` });
      if (isSupabaseConfigured) get().fetchCotizaciones();
    }
  },

  subscribeToRealtime: () => {
    if (!isSupabaseConfigured) return () => {};
    const supabase = getSupabaseClient()!;

    set({ realtimeStatus: "connecting" });

    const channel = supabase
      .channel("cotizaciones-realtime")
      .on<Record<string, unknown>>(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cotizaciones" },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (!payload.new || !("id" in payload.new)) return;
          const nueva = dbToCotizacion(payload.new);
          set((state) => {
            if (state.cotizaciones.some((c) => c.id === nueva.id)) return state;
            return { cotizaciones: [nueva, ...state.cotizaciones] };
          });
        }
      )
      .on<Record<string, unknown>>(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "cotizaciones" },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (!payload.new || !("id" in payload.new)) return;
          const updated = dbToCotizacion(payload.new);
          set((state) => ({
            cotizaciones: state.cotizaciones.map((c) => c.id === updated.id ? updated : c),
          }));
        }
      )
      .on<Record<string, unknown>>(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "cotizaciones" },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (!payload.old || !("id" in payload.old)) return;
          const deletedId = payload.old.id as string;
          set((state) => ({
            cotizaciones: state.cotizaciones.filter((c) => c.id !== deletedId),
          }));
        }
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          set({ realtimeStatus: "connected" });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          set({ realtimeStatus: "disconnected" });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      set({ realtimeStatus: "disconnected" });
    };
  },
}));
