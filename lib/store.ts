import { create } from "zustand";
import { Cotizacion, EstadoCotizacion } from "./types";
import {
  fetchCotizaciones as sbFetch,
  createCotizacion as sbCreate,
  updateCotizacion as sbUpdate,
  deleteCotizacion as sbDelete,
  moverEstado as sbMover,
} from "./supabaseService";
import { isSupabaseConfigured } from "./supabase";

interface CotizacionStore {
  cotizaciones: Cotizacion[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  fetchCotizaciones: () => Promise<void>;
  addCotizacion: (
    data: Omit<Cotizacion, "id" | "numeroCotizacion" | "creadoEn" | "actualizadoEn">
  ) => Promise<{ error: string | null }>;
  updateCotizacion: (id: string, data: Partial<Cotizacion>) => Promise<{ error: string | null }>;
  deleteCotizacion: (id: string) => Promise<{ error: string | null }>;
  moverEstado: (id: string, nuevoEstado: EstadoCotizacion) => Promise<void>;
  clearError: () => void;
}

export const useCotizacionStore = create<CotizacionStore>((set, get) => ({
  cotizaciones: [],
  loading: false,
  error: null,
  initialized: false,

  clearError: () => set({ error: null }),

  // ── Cargar desde Supabase ──────────────────────────────────────────────────
  fetchCotizaciones: async () => {
    set({ loading: true, error: null });
    const { data, error } = await sbFetch();
    if (error) {
      set({ loading: false, error: `Error al cargar cotizaciones: ${error}` });
      return;
    }
    set({ cotizaciones: data, loading: false, initialized: true });
  },

  // ── Crear ──────────────────────────────────────────────────────────────────
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

  // ── Actualizar ─────────────────────────────────────────────────────────────
  updateCotizacion: async (id, fields) => {
    // Optimistic update
    set((state) => ({
      cotizaciones: state.cotizaciones.map((c) =>
        c.id === id
          ? { ...c, ...fields, actualizadoEn: new Date().toISOString() }
          : c
      ),
    }));
    const { error } = await sbUpdate(id, fields);
    if (error) {
      set({ error: `Error al actualizar: ${error}` });
      // Revert: reload from Supabase
      if (isSupabaseConfigured) get().fetchCotizaciones();
      return { error };
    }
    return { error: null };
  },

  // ── Eliminar ───────────────────────────────────────────────────────────────
  deleteCotizacion: async (id) => {
    // Optimistic remove
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

  // ── Mover estado (Kanban) ──────────────────────────────────────────────────
  moverEstado: async (id, nuevoEstado) => {
    // Optimistic update
    set((state) => ({
      cotizaciones: state.cotizaciones.map((c) =>
        c.id === id
          ? { ...c, estado: nuevoEstado, actualizadoEn: new Date().toISOString() }
          : c
      ),
    }));
    const { error } = await sbMover(id, nuevoEstado);
    if (error) {
      set({ error: `Error al mover cotización: ${error}` });
      if (isSupabaseConfigured) get().fetchCotizaciones();
    }
  },
}));
