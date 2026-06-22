import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Cotizacion, EstadoCotizacion } from "./types";
import { cotizacionesEjemplo } from "./data";
import { generateId, generateNumeroCotizacion } from "./utils";

interface CotizacionStore {
  cotizaciones: Cotizacion[];
  addCotizacion: (data: Omit<Cotizacion, "id" | "numeroCotizacion" | "creadoEn" | "actualizadoEn">) => void;
  updateCotizacion: (id: string, data: Partial<Cotizacion>) => void;
  deleteCotizacion: (id: string) => void;
  moverEstado: (id: string, nuevoEstado: EstadoCotizacion) => void;
}

export const useCotizacionStore = create<CotizacionStore>()(
  persist(
    (set, get) => ({
      cotizaciones: cotizacionesEjemplo,

      addCotizacion: (data) => {
        const { cotizaciones } = get();
        const nueva: Cotizacion = {
          ...data,
          id: generateId(),
          numeroCotizacion: generateNumeroCotizacion(cotizaciones.length),
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        };
        set({ cotizaciones: [nueva, ...cotizaciones] });
      },

      updateCotizacion: (id, data) => {
        set((state) => ({
          cotizaciones: state.cotizaciones.map((c) =>
            c.id === id
              ? { ...c, ...data, actualizadoEn: new Date().toISOString() }
              : c
          ),
        }));
      },

      deleteCotizacion: (id) => {
        set((state) => ({
          cotizaciones: state.cotizaciones.filter((c) => c.id !== id),
        }));
      },

      moverEstado: (id, nuevoEstado) => {
        set((state) => ({
          cotizaciones: state.cotizaciones.map((c) =>
            c.id === id
              ? { ...c, estado: nuevoEstado, actualizadoEn: new Date().toISOString() }
              : c
          ),
        }));
      },
    }),
    {
      name: "serva-cotizaciones",
    }
  )
);
