"use client";
import { Cotizacion, ESTADOS } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCotizacionStore } from "@/lib/store";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  ExternalLink, Calendar, User, Building2, Tag, TrendingUp,
  FileText, Edit3, Trash2, MessageSquare, AlertTriangle
} from "lucide-react";
import { useState } from "react";

interface Props {
  cotizacion: Cotizacion;
  onEdit: () => void;
  onClose: () => void;
}

const prioridadColor: Record<string, "danger" | "warning" | "neutral"> = {
  Alta: "danger",
  Media: "warning",
  Baja: "neutral",
};

const estadoVariant: Record<string, "warning" | "info" | "success" | "danger"> = {
  pendiente: "warning",
  enviada: "info",
  aprobada: "success",
  rechazada: "danger",
};

export default function CotizacionDetail({ cotizacion, onEdit, onClose }: Props) {
  const { deleteCotizacion } = useCotizacionStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteCotizacion(cotizacion.id);
    setDeleting(false);
    onClose();
  };

  const estado = ESTADOS[cotizacion.estado];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400">{cotizacion.numeroCotizacion}</span>
            <Badge variant={estadoVariant[cotizacion.estado]}>
              {estado.label}
            </Badge>
            <Badge variant={prioridadColor[cotizacion.prioridad]}>
              {cotizacion.prioridad} prioridad
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{cotizacion.nombreServicio}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{cotizacion.categoria}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            <Edit3 size={14} />
            Editar
          </Button>
          {!confirmDelete ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} />
              Eliminar
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              <span className="text-xs text-red-600 font-medium">¿Confirmar?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-bold text-red-700 hover:text-red-900 disabled:opacity-50"
              >
                {deleting ? "…" : "Sí"}
              </button>
              <span className="text-red-300">|</span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Monto y probabilidad */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-serva-green-pale rounded-xl p-4 col-span-1">
          <p className="text-xs font-semibold text-serva-green uppercase tracking-wide mb-1">Monto</p>
          <p className="text-2xl font-bold text-serva-green-dark">{formatCurrency(cotizacion.monto)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Probabilidad</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-800">{cotizacion.probabilidadCierre}%</p>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-serva-green rounded-full"
              style={{ width: `${cotizacion.probabilidadCierre}%` }}
            />
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cierre Est.</p>
          <p className="text-sm font-semibold text-gray-800 mt-1">{formatDate(cotizacion.fechaCierreEstimada)}</p>
        </div>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Detail icon={<Building2 size={15} />} label="Cliente" value={cotizacion.cliente} />
        <Detail icon={<User size={15} />} label="Proveedor" value={cotizacion.proveedor} />
        <Detail icon={<User size={15} />} label="Responsable" value={cotizacion.responsable} />
        <Detail icon={<Tag size={15} />} label="Categoría" value={cotizacion.categoria} />
        <Detail icon={<Calendar size={15} />} label="Solicitud" value={formatDate(cotizacion.fechaSolicitud)} />
        <Detail icon={<Calendar size={15} />} label="Envío" value={formatDate(cotizacion.fechaEnvio)} />
      </div>

      {/* Próxima acción */}
      {cotizacion.proximaAccion && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-blue-500" />
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Próxima Acción</p>
          </div>
          <p className="text-sm text-blue-800">{cotizacion.proximaAccion}</p>
        </div>
      )}

      {/* Motivo de rechazo */}
      {cotizacion.motivoRechazo && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-500" />
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Motivo de Rechazo</p>
          </div>
          <p className="text-sm text-red-700">{cotizacion.motivoRechazo}</p>
        </div>
      )}

      {/* Notas */}
      {cotizacion.notas && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-gray-400" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notas Internas</p>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{cotizacion.notas}</p>
        </div>
      )}

      {/* Google Sheets */}
      {cotizacion.enlaceSheets ? (
        <a
          href={cotizacion.enlaceSheets}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-serva-green/5 border border-serva-green/20 rounded-xl hover:bg-serva-green/10 transition-colors group"
        >
          <div className="w-9 h-9 bg-serva-green rounded-lg flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-serva-green">Abrir cotización en Google Sheets</p>
            <p className="text-xs text-gray-400 truncate max-w-xs">{cotizacion.enlaceSheets}</p>
          </div>
          <ExternalLink size={16} className="ml-auto text-serva-green opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
          <FileText size={18} className="text-gray-300" />
          <p className="text-sm text-gray-400">Sin enlace a Google Sheets aún</p>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Creado: {new Date(cotizacion.creadoEn).toLocaleDateString("es-MX")}
        </p>
        <p className="text-xs text-gray-400">
          Actualizado: {new Date(cotizacion.actualizadoEn).toLocaleDateString("es-MX")}
        </p>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
}
