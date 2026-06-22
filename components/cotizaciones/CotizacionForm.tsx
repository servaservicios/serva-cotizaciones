"use client";
import { useState } from "react";
import { Cotizacion, CATEGORIAS, RESPONSABLES } from "@/lib/types";
import { useCotizacionStore } from "@/lib/store";
import { ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

/* ── Field components ───────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

const fieldClass = "w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-white focus:ring-2 focus:ring-serva-green/30 focus:border-serva-green transition-all placeholder:text-gray-300";
const errorClass = "border-red-300 focus:ring-red-200 focus:border-red-400";

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-1">
      <span className="w-6 h-6 bg-serva-green text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
        {n}
      </span>
      <h3 className="text-xs font-bold text-serva-green uppercase tracking-widest">{children}</h3>
    </div>
  );
}

/* ── Main component ─────────────────────────────────── */
export default function CotizacionForm({ cotizacion, onClose }: Props) {
  const { addCotizacion, updateCotizacion } = useCotizacionStore();
  const [form, setForm] = useState(cotizacion ?? defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombreServicio.trim()) errs.nombreServicio = "Requerido";
    if (!form.cliente.trim()) errs.cliente = "Requerido";
    if (!form.proveedor.trim()) errs.proveedor = "Requerido";
    if (form.monto < 0) errs.monto = "El monto no puede ser negativo";
    if (!form.fechaSolicitud) errs.fechaSolicitud = "Requerido";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setSubmitError(null);
    const result = cotizacion
      ? await updateCotizacion(cotizacion.id, form)
      : await addCotizacion(form);
    if (result.error) { setSubmitError(result.error); setLoading(false); return; }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-4">

      {/* Error banner */}
      {submitError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertCircle size={15} className="flex-shrink-0" />
          {submitError}
        </div>
      )}

      {/* ── 1. Servicio ──────────────────────────────────── */}
      <div>
        <SectionTitle n={1}>Información del servicio</SectionTitle>
        <div className="space-y-4">
          <div>
            <Label>Nombre del servicio *</Label>
            <input
              className={cn(fieldClass, errors.nombreServicio ? errorClass : "")}
              value={form.nombreServicio}
              onChange={(e) => set("nombreServicio", e.target.value)}
              placeholder="Ej. Limpieza General de Oficinas"
              autoComplete="off"
            />
            {errors.nombreServicio && <p className="text-xs text-red-500 mt-1">{errors.nombreServicio}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoría</Label>
              <select
                className={fieldClass + " appearance-none"}
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value)}
              >
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Prioridad</Label>
              <select
                className={fieldClass + " appearance-none"}
                value={form.prioridad}
                onChange={(e) => set("prioridad", e.target.value as "Alta" | "Media" | "Baja")}
              >
                <option value="Alta">🔴 Alta</option>
                <option value="Media">🟡 Media</option>
                <option value="Baja">⚪ Baja</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Cliente y Proveedor ───────────────────────── */}
      <div>
        <SectionTitle n={2}>Cliente y proveedor</SectionTitle>
        <div className="space-y-4">
          <div>
            <Label>Cliente *</Label>
            <input
              className={cn(fieldClass, errors.cliente ? errorClass : "")}
              value={form.cliente}
              onChange={(e) => set("cliente", e.target.value)}
              placeholder="Razón social o nombre"
              autoCapitalize="words"
            />
            {errors.cliente && <p className="text-xs text-red-500 mt-1">{errors.cliente}</p>}
          </div>
          <div>
            <Label>Proveedor asignado *</Label>
            <input
              className={cn(fieldClass, errors.proveedor ? errorClass : "")}
              value={form.proveedor}
              onChange={(e) => set("proveedor", e.target.value)}
              placeholder="Nombre del proveedor"
              autoCapitalize="words"
            />
            {errors.proveedor && <p className="text-xs text-red-500 mt-1">{errors.proveedor}</p>}
          </div>
        </div>
      </div>

      {/* ── 3. Monto ────────────────────────────────────── */}
      <div>
        <SectionTitle n={3}>Monto y fechas</SectionTitle>
        <div className="space-y-4">
          <div>
            <Label>Monto cotizado (MXN) SIN IVA *</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-base">$</span>
              <input
                type="number"
                inputMode="decimal"
                className={cn(fieldClass, "pl-8", errors.monto ? errorClass : "")}
                value={form.monto === 0 ? "" : form.monto}
                onChange={(e) => set("monto", parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
            {errors.monto && <p className="text-xs text-red-500 mt-1">{errors.monto}</p>}
          </div>

          {/* Probabilidad */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Probabilidad de cierre</Label>
              <span className="text-sm font-bold text-serva-green">{form.probabilidadCierre}%</span>
            </div>
            <input
              type="range"
              min="0" max="100"
              value={form.probabilidadCierre}
              onChange={(e) => set("probabilidadCierre", parseInt(e.target.value))}
              className="w-full h-2 accent-serva-green rounded-full"
            />
            <div className="flex justify-between text-[10px] text-gray-300 mt-1">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fecha de solicitud *</Label>
              <input
                type="date"
                className={cn(fieldClass, errors.fechaSolicitud ? errorClass : "")}
                value={form.fechaSolicitud}
                onChange={(e) => set("fechaSolicitud", e.target.value)}
              />
              {errors.fechaSolicitud && <p className="text-xs text-red-500 mt-1">{errors.fechaSolicitud}</p>}
            </div>
            <div>
              <Label>Fecha de envío</Label>
              <input
                type="date"
                className={fieldClass}
                value={form.fechaEnvio}
                onChange={(e) => set("fechaEnvio", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Seguimiento ──────────────────────────────── */}
      <div>
        <SectionTitle n={4}>Seguimiento</SectionTitle>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Responsable</Label>
              <select
                className={fieldClass + " appearance-none"}
                value={form.responsable}
                onChange={(e) => set("responsable", e.target.value)}
              >
                {RESPONSABLES.map((r) => <option key={r} value={r}>{r.split(" ")[0]}</option>)}
              </select>
            </div>
            <div>
              <Label>Estado</Label>
              <select
                className={fieldClass + " appearance-none"}
                value={form.estado}
                onChange={(e) => set("estado", e.target.value as "pendiente" | "enviada" | "aprobada" | "rechazada")}
              >
                <option value="pendiente">Pendiente</option>
                <option value="enviada">Enviada</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Próxima acción</Label>
            <input
              className={fieldClass}
              value={form.proximaAccion}
              onChange={(e) => set("proximaAccion", e.target.value)}
              placeholder="Ej. Llamar al cliente el lunes"
              autoCapitalize="sentences"
            />
          </div>

          {form.estado === "rechazada" && (
            <div>
              <Label>Motivo de rechazo</Label>
              <input
                className={fieldClass}
                value={form.motivoRechazo}
                onChange={(e) => set("motivoRechazo", e.target.value)}
                placeholder="¿Por qué fue rechazada?"
                autoCapitalize="sentences"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Google Sheets ────────────────────────────── */}
      <div>
        <SectionTitle n={5}>Google Sheets</SectionTitle>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <input
              type="url"
              inputMode="url"
              className={fieldClass}
              value={form.enlaceSheets}
              onChange={(e) => set("enlaceSheets", e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/…"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          {form.enlaceSheets && (
            <a
              href={form.enlaceSheets}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl bg-serva-green-pale text-serva-green flex items-center justify-center flex-shrink-0 tap-target"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>

      {/* ── 6. Notas ────────────────────────────────────── */}
      <div>
        <SectionTitle n={6}>Notas internas</SectionTitle>
        <textarea
          className={fieldClass + " resize-none"}
          rows={3}
          value={form.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Observaciones, contexto, acuerdos…"
          autoCapitalize="sentences"
        />
      </div>

      {/* ── Submit ──────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-4 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm tap-target"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-4 rounded-xl bg-serva-green text-white font-bold text-sm disabled:opacity-60 shadow-sm tap-target"
        >
          {loading ? "Guardando…" : cotizacion ? "Guardar cambios" : "Crear cotización"}
        </button>
      </div>
    </form>
  );
}
