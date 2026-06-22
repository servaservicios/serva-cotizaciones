"use client";
import { Cotizacion } from "@/lib/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ExternalLink, Calendar, Building2, ChevronRight } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  cotizacion: Cotizacion;
  onClick: () => void;
}

const prioridadDot: Record<string, string> = {
  Alta: "bg-red-500",
  Media: "bg-amber-400",
  Baja: "bg-gray-300",
};

const prioridadBg: Record<string, string> = {
  Alta: "bg-red-50 text-red-700",
  Media: "bg-amber-50 text-amber-700",
  Baja: "bg-gray-100 text-gray-500",
};

export default function CotizacionCard({ cotizacion, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cotizacion.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer shadow-sm card-enter",
        "active:scale-[0.98] transition-all duration-150",
        "hover:shadow-md hover:border-serva-green/20",
        isDragging ? "shadow-xl rotate-1 border-serva-green/40" : ""
      )}
    >
      {/* Top row */}
      <div className="flex items-start gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={cn("w-2 h-2 rounded-full flex-shrink-0", prioridadDot[cotizacion.prioridad])} />
            <span className="text-[11px] text-gray-400 font-medium">{cotizacion.numeroCotizacion}</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
            {cotizacion.nombreServicio}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {cotizacion.enlaceSheets && (
            <a
              href={cotizacion.enlaceSheets}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-lg bg-serva-green-pale text-serva-green flex items-center justify-center tap-target"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Cliente */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <Building2 size={13} className="text-gray-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-gray-700 truncate">{cotizacion.cliente}</span>
      </div>

      {/* Monto + prioridad */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
        <span className="text-base font-bold text-serva-green">
          {cotizacion.monto > 0 ? formatCurrency(cotizacion.monto) : "Sin monto"}
        </span>
        <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", prioridadBg[cotizacion.prioridad])}>
          {cotizacion.prioridad}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar size={11} />
          <span>{formatDate(cotizacion.fechaSolicitud)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400">{cotizacion.probabilidadCierre}%</span>
          <div className="w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-serva-green rounded-full" style={{ width: `${cotizacion.probabilidadCierre}%` }} />
          </div>
        </div>
      </div>

      {/* Próxima acción */}
      {cotizacion.proximaAccion && (
        <div className="mt-2 flex items-start gap-1">
          <ChevronRight size={11} className="text-serva-green flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500 line-clamp-1">{cotizacion.proximaAccion}</p>
        </div>
      )}

      {/* Responsable */}
      <div className="mt-2 flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full bg-serva-green/10 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-serva-green">
            {cotizacion.responsable.charAt(0)}
          </span>
        </div>
        <span className="text-[11px] text-gray-400">{cotizacion.responsable.split(" ")[0]}</span>
      </div>
    </div>
  );
}
