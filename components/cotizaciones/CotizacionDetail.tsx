"use client";
import { useState } from "react";
import { Cotizacion, ESTADOS, EstadoCotizacion } from "@/lib/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useCotizacionStore } from "@/lib/store";
import {
  ExternalLink, Calendar, User, Building2, Tag, TrendingUp,
  FileText, Edit3, Trash2, MessageSquare, AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface Props {
  cotizacion: Cotizacion;
  onEdit: () => void;
  onClose: () => void;
}

const estadoVariant: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  enviada:   "bg-blue-100 text-blue-800",
  aprobada:  "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
};

const prioridadBg: Record<string, string> = {
  Alta:  "bg-red-100 text-red-700",
  Media: "bg-amber-100 text-amber-700",
  Baja:  "bg-gray-100 text-gray-500",
};

const MOVE_OPTIONS: { id: EstadoCotizacion; label: string; color: string }[] = [
  { id: "pendiente",  label: "Pendiente",  color: "bg-amber-50 border-amber-200 text-amber-700" },
  { id: "enviada",    label: "Enviada",    color: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "aprobada",   label: "Aprobada",   color: "bg-green-50 border-green-200 text-green-700" },
  { id: "rechazada",  label: "Rechazada",  color: "bg-red-50 border-red-200 text-red-600" },
];

export default function CotizacionDetail({ cotizacion, onEdit, onClose }: Props) {
  const { deleteCotizacion, moverEstado } = useCotizacionStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteCotizacion(cotizacion.id);
    setDeleting(false);
    onClose();
  };

  const handleMove = async (estado: EstadoCotizacion) => {
    setMoving(true);
    await moverEstado(cotizacion.id, estado);
    setMoving(false);
    onClose();
  };

  return (
    <div className="space-y-5 pb-4">

      {/* ── Header ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="text-xs font-medium text-gray-400">{cotizacion.numeroCotizacion}</span>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", estadoVariant[cotizacion.estado])}>
            {ESTADOS[cotizacion.estado].label}
          </span>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", prioridadBg[cotizacion.prioridad])}>
            {cotizacion.prioridad}
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 leading-snug">{cotizacion.nombreServicio}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{cotizacion.categoria}</p>
      </div>

      {/* ── Monto destacado ────────────────────────────── */}
      <div className="bg-serva-green-pale rounded-2xl px-5 py-4">
        <p className="text-xs font-semibold text-serva-green uppercase tracking-wide mb-1">Monto SIN IVA</p>
        <p className="text-3xl font-black text-serva-green-dark">
          {cotizacion.monto > 0 ? formatCurrency(cotizacion.monto) : "Sin definir"}
        </p>
      </div>

      {/* ── Quick move ─────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Mover a…</p>
        <div className="grid grid-cols-2 gap-2">
          {MOVE_OPTIONS.filter((o) => o.id !== cotizacion.estado).map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleMove(opt.id)}
              disabled={moving}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold tap-target transition-all active:scale-95",
                opt.color,
                moving ? "opacity-50" : ""
              )}
            >
              {opt.label}
              <ArrowRight size={13} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Detalles ───────────────────────────────────── */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
        <Row icon={<Building2 size={15} />} label="Cliente" value={cotizacion.cliente} />
        <Row icon={<User size={15} />} label="Proveedor" value={cotizacion.proveedor} />
        <Row icon={<User size={15} />} label="Responsable" value={cotizacion.responsable} />
        <Row icon={<Tag size={15} />} label="Categoría" value={cotizacion.categoria} />
        <Row icon={<Calendar size={15} />} label="Solicitud" value={formatDate(cotizacion.fechaSolicitud)} />
        <Row icon={<Calendar size={15} />} label="Envío" value={formatDate(cotizacion.fechaEnvio)} />
      </div>

      {/* ── Próxima acción ─────────────────────────────── */}
      {cotizacion.proximaAccion && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp size={14} className="text-blue-500" />
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Próxima Acción</p>
          </div>
          <p className="text-sm text-blue-800">{cotizacion.proximaAccion}</p>
        </div>
      )}

      {/* ── Motivo rechazo ─────────────────────────────── */}
      {cotizacion.motivoRechazo && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle size={14} className="text-red-500" />
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Motivo de Rechazo</p>
          </div>
          <p className="text-sm text-red-700">{cotizacion.motivoRechazo}</p>
        </div>
      )}

      {/* ── Notas ──────────────────────────────────────── */}
      {cotizacion.notas && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-gray-400" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notas Internas</p>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{cotizacion.notas}</p>
        </div>
      )}

      {/* ── Google Sheets ──────────────────────────────── */}
      {cotizacion.enlaceSheets ? (
        <a
          href={cotizacion.enlaceSheets}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-serva-green/5 border border-serva-green/20 rounded-2xl active:bg-serva-green/10 transition-colors group tap-target"
        >
          <div className="w-10 h-10 bg-serva-green rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-serva-green">Abrir en Google Sheets</p>
            <p className="text-xs text-gray-400 truncate">{cotizacion.enlaceSheets}</p>
          </div>
          <ExternalLink size={16} className="text-serva-green flex-shrink-0" />
        </a>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
          <FileText size={16} className="text-gray-300" />
          <p className="text-sm text-gray-400">Sin enlace a Google Sheets</p>
        </div>
      )}

      {/* ── Acciones ───────────────────────────────────── */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-serva-green-pale text-serva-green font-bold text-sm tap-target"
        >
          <Edit3 size={15} />
          Editar
        </button>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm tap-target"
          >
            <Trash2 size={15} />
            Eliminar
          </button>
        ) : (
          <div className="flex-1 flex items-center gap-2 justify-center bg-red-50 rounded-xl border border-red-200 px-3">
            <span className="text-xs text-red-600 font-medium">¿Confirmar?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-black text-red-700 tap-target px-1"
            >
              {deleting ? "…" : "Sí"}
            </button>
            <span className="text-red-200">|</span>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500 tap-target px-1">No</button>
          </div>
        )}
      </div>

      {/* Meta */}
      <p className="text-center text-[10px] text-gray-300">
        Actualizado {new Date(cotizacion.actualizadoEn).toLocaleDateString("es-MX")}
      </p>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
}
