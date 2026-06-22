"use client";
import { Cotizacion, ESTADOS } from "@/lib/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ExternalLink, Calendar, User, Building2, ChevronRight, AlertCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  cotizacion: Cotizacion;
  onClick: () => void;
}

const prioridadColor: Record<string, string> = {
  Alta: "danger",
  Media: "warning",
  Baja: "neutral",
};

const prioridadDot: Record<string, string> = {
  Alta: "bg-red-500",
  Media: "bg-amber-400",
  Baja: "bg-gray-400",
};

export default function CotizacionCard({ cotizacion, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cotizacion.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue =
    cotizacion.fechaCierreEstimada &&
    new Date(cotizacion.fechaCierreEstimada) < new Date() &&
    cotizacion.estado !== "aprobada" &&
    cotizacion.estado !== "rechazada";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-gray-100 p-4 cursor-pointer shadow-sm",
        "hover:shadow-md hover:border-serva-green/30 transition-all duration-200 card-enter",
        isDragging ? "shadow-xl border-serva-green/50 rotate-1" : "",
        isOverdue ? "border-l-4 border-l-red-400" : "border-l-4 border-l-transparent"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={cn("w-2 h-2 rounded-full flex-shrink-0", prioridadDot[cotizacion.prioridad])}
            />
            <span className="text-xs text-gray-400 font-medium">{cotizacion.numeroCotizacion}</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
            {cotizacion.nombreServicio}
          </h4>
        </div>
        {cotizacion.enlaceSheets && (
          <a
            href={cotizacion.enlaceSheets}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 p-1.5 rounded-lg bg-serva-green-pale text-serva-green hover:bg-serva-green-mid transition-colors"
            title="Abrir en Google Sheets"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Cliente y Proveedor */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Building2 size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate font-medium">{cotizacion.cliente}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <User size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{cotizacion.proveedor}</span>
        </div>
      </div>

      {/* Monto */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-bold text-serva-green">
          {formatCurrency(cotizacion.monto)}
        </span>
        <Badge variant={prioridadColor[cotizacion.prioridad] as "danger" | "warning" | "neutral"}>
          {cotizacion.prioridad}
        </Badge>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar size={11} />
          <span>{formatDate(cotizacion.fechaSolicitud)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isOverdue && (
            <AlertCircle size={13} className="text-red-400" aria-label="Fecha de cierre vencida" />
          )}
          <span className="text-xs font-medium text-gray-500">{cotizacion.probabilidadCierre}%</span>
          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-serva-green rounded-full transition-all"
              style={{ width: `${cotizacion.probabilidadCierre}%` }}
            />
          </div>
        </div>
      </div>

      {/* Próxima acción */}
      {cotizacion.proximaAccion && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-50 flex items-start gap-1.5">
          <ChevronRight size={12} className="text-serva-green flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 line-clamp-1">{cotizacion.proximaAccion}</p>
        </div>
      )}

      {/* Responsable */}
      <div className="mt-2 flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full bg-serva-green/10 flex items-center justify-center">
          <span className="text-xs font-bold text-serva-green">
            {cotizacion.responsable.charAt(0)}
          </span>
        </div>
        <span className="text-xs text-gray-400 truncate">{cotizacion.responsable.split(" ")[0]}</span>
      </div>
    </div>
  );
}
