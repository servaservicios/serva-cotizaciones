"use client";
import { useState } from "react";
import { Cotizacion, CATEGORIAS, RESPONSABLES } from "@/lib/types";
import { useCotizacionStore } from "@/lib/store";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { ExternalLink } from "lucide-react";

interface Props {
  cotizacion?: Cotizacion;
  onClose: () => void;
}

const defaultForm = {
  nombreServicio: "",
  cliente: "",
  proveedor: "",
  monto: 0,
  fechaSolicitud: new Date().toISOString().split("T")[0],
  fechaEnvio: "",
  fechaCierreEstimada: "",
  responsable: RESPONSABLES[0],
  estado: "pendiente" as const,
  proximaAccion: "",
  notas: "",
  enlaceSheets: "",
  categoria: CATEGORIAS[0],
  prioridad: "Media" as const,
  probabilidadCierre: 50,
  motivoRechazo: "",
};

export default function CotizacionForm({ cotizacion, onClose }: Props) {
  const { addCotizacion, updateCotizacion } = useCotizacionStore();
  const [form, setForm] = useState(cotizacion ?? defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombreServicio.trim()) errs.nombreServicio = "Requerido";
    if (!form.cliente.trim()) errs.cliente = "Requerido";
    if (!form.proveedor.trim()) errs.proveedor = "Requerido";
    if (!form.monto || form.monto <= 0) errs.monto = "Ingresa un monto válido";
    if (!form.fechaSolicitud) errs.fechaSolicitud = "Requerido";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    if (cotizacion) {
      updateCotizacion(cotizacion.id, form);
    } else {
      addCotizacion(form);
    }
    setLoading(false);
    onClose();
  };

  const estadoOpts = [
    { value: "pendiente", label: "Pendiente" },
    { value: "enviada", label: "Enviada" },
    { value: "aprobada", label: "Aprobada" },
    { value: "rechazada", label: "Rechazada" },
  ];

  const prioridadOpts = [
    { value: "Alta", label: "Alta" },
    { value: "Media", label: "Media" },
    { value: "Baja", label: "Baja" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sección 1: Información del Servicio */}
      <div>
        <h3 className="text-xs font-bold text-serva-green uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-5 h-5 bg-serva-green text-white rounded-full flex items-center justify-center text-xs">1</span>
          Información del Servicio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Nombre del servicio *"
              value={form.nombreServicio}
              onChange={(e) => set("nombreServicio", e.target.value)}
              error={errors.nombreServicio}
              placeholder="Ej. Limpieza General de Oficinas"
            />
          </div>
          <Select
            label="Categoría"
            value={form.categoria}
            onChange={(e) => set("categoria", e.target.value)}
            options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
          />
          <Select
            label="Prioridad"
            value={form.prioridad}
            onChange={(e) => set("prioridad", e.target.value as "Alta" | "Media" | "Baja")}
            options={prioridadOpts}
          />
        </div>
      </div>

      {/* Sección 2: Cliente y Proveedor */}
      <div>
        <h3 className="text-xs font-bold text-serva-green uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-5 h-5 bg-serva-green text-white rounded-full flex items-center justify-center text-xs">2</span>
          Cliente y Proveedor
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Cliente *"
            value={form.cliente}
            onChange={(e) => set("cliente", e.target.value)}
            error={errors.cliente}
            placeholder="Razón social o nombre"
          />
          <Input
            label="Proveedor asignado *"
            value={form.proveedor}
            onChange={(e) => set("proveedor", e.target.value)}
            error={errors.proveedor}
            placeholder="Nombre del proveedor"
          />
        </div>
      </div>

      {/* Sección 3: Monto y Fechas */}
      <div>
        <h3 className="text-xs font-bold text-serva-green uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-5 h-5 bg-serva-green text-white rounded-full flex items-center justify-center text-xs">3</span>
          Monto y Fechas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Monto cotizado (MXN) SIN IVA *"
            type="number"
            value={form.monto || ""}
            onChange={(e) => set("monto", parseFloat(e.target.value) || 0)}
            error={errors.monto}
            placeholder="0"
            min="0"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Probabilidad de cierre (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={form.probabilidadCierre}
                onChange={(e) => set("probabilidadCierre", parseInt(e.target.value))}
                className="flex-1 accent-serva-green"
              />
              <span className="text-sm font-semibold text-serva-green w-10 text-right">
                {form.probabilidadCierre}%
              </span>
            </div>
          </div>
          <Input
            label="Fecha de solicitud *"
            type="date"
            value={form.fechaSolicitud}
            onChange={(e) => set("fechaSolicitud", e.target.value)}
            error={errors.fechaSolicitud}
          />
          <Input
            label="Fecha de envío"
            type="date"
            value={form.fechaEnvio}
            onChange={(e) => set("fechaEnvio", e.target.value)}
          />
        </div>
      </div>

      {/* Sección 4: Seguimiento */}
      <div>
        <h3 className="text-xs font-bold text-serva-green uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-5 h-5 bg-serva-green text-white rounded-full flex items-center justify-center text-xs">4</span>
          Seguimiento
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Responsable interno"
            value={form.responsable}
            onChange={(e) => set("responsable", e.target.value)}
            options={RESPONSABLES.map((r) => ({ value: r, label: r }))}
          />
          <Select
            label="Estado"
            value={form.estado}
            onChange={(e) => set("estado", e.target.value as "pendiente" | "enviada" | "aprobada" | "rechazada")}
            options={estadoOpts}
          />
          <div className="sm:col-span-2">
            <Input
              label="Próxima acción / Seguimiento"
              value={form.proximaAccion}
              onChange={(e) => set("proximaAccion", e.target.value)}
              placeholder="Ej. Llamar al cliente el lunes para confirmar"
            />
          </div>
          {form.estado === "rechazada" && (
            <div className="sm:col-span-2">
              <Input
                label="Motivo de rechazo"
                value={form.motivoRechazo}
                onChange={(e) => set("motivoRechazo", e.target.value)}
                placeholder="¿Por qué se rechazó la cotización?"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sección 5: Cotización en Google Sheets */}
      <div>
        <h3 className="text-xs font-bold text-serva-green uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-5 h-5 bg-serva-green text-white rounded-full flex items-center justify-center text-xs">5</span>
          Google Sheets
        </h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="Enlace a Google Sheets"
              value={form.enlaceSheets}
              onChange={(e) => set("enlaceSheets", e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </div>
          {form.enlaceSheets && (
            <a
              href={form.enlaceSheets}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 p-2 rounded-lg bg-serva-green-pale text-serva-green hover:bg-serva-green-mid transition-colors"
              title="Abrir en Google Sheets"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>

      {/* Sección 6: Notas */}
      <div>
        <h3 className="text-xs font-bold text-serva-green uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-5 h-5 bg-serva-green text-white rounded-full flex items-center justify-center text-xs">6</span>
          Notas Internas
        </h3>
        <Textarea
          label="Notas internas"
          value={form.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Observaciones, contexto, acuerdos..."
          rows={3}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {cotizacion ? "Guardar cambios" : "Crear cotización"}
        </Button>
      </div>
    </form>
  );
}
