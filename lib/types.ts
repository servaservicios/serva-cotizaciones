export type EstadoCotizacion =
  | "pendiente"
  | "enviada"
  | "aprobada"
  | "rechazada";

export type Prioridad = "Alta" | "Media" | "Baja";

export interface Cotizacion {
  id: string;
  numeroCotizacion: string;
  nombreServicio: string;
  cliente: string;
  proveedor: string;
  monto: number;
  fechaSolicitud: string;
  fechaEnvio: string;
  fechaCierreEstimada: string;
  responsable: string;
  estado: EstadoCotizacion;
  proximaAccion: string;
  notas: string;
  enlaceSheets: string;
  categoria: string;
  prioridad: Prioridad;
  probabilidadCierre: number;
  motivoRechazo: string;
  creadoEn: string;
  actualizadoEn: string;
}

export const ESTADOS: Record<EstadoCotizacion, { label: string; color: string; bg: string }> = {
  pendiente: {
    label: "Pendiente",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  enviada: {
    label: "Enviada",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  aprobada: {
    label: "Aprobada",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  rechazada: {
    label: "Rechazada",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
};

export const CATEGORIAS = [
  "Eléctrico",
  "Instalación",
  "Plomería",
  "Mudanzas",
  "Fumigación",
  "Limpieza General",
  "Limpieza Profunda",
  "Limpieza Post-Construcción",
  "Limpieza Muebles",
  "Limpieza Trampa de Grasa",
  "Limpieza Fosa Séptica",
];

export const RESPONSABLES = [
  "Diego Rodríguez",
  "Patricio Blanco",
];
