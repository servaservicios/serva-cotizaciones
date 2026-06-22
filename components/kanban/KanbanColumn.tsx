"use client";
import { Cotizacion, EstadoCotizacion } from "@/lib/types";
import CotizacionCard from "@/components/cotizaciones/CotizacionCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { formatCurrency, cn } from "@/lib/utils";

interface Props {
  id: EstadoCotizacion;
  title: string;
  cotizaciones: Cotizacion[];
  color: string;
  headerBg: string;
  icon: React.ReactNode;
  onCardClick: (c: Cotizacion) => void;
}

export default function KanbanColumn({ id, title, cotizaciones, color, headerBg, icon, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const total = cotizaciones.reduce((s, c) => s + c.monto, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn("rounded-xl px-4 py-3 mb-3 flex-shrink-0", headerBg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={color}>{icon}</span>
            <h3 className={cn("text-sm font-bold", color)}>{title}</h3>
          </div>
          <span className={cn("text-xs font-bold rounded-full px-2 py-0.5 bg-white/70", color)}>
            {cotizaciones.length}
          </span>
        </div>
        {total > 0 && (
          <p className={cn("text-xs mt-0.5 font-medium opacity-70", color)}>
            {formatCurrency(total)}
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl p-2 kanban-col-scroll transition-colors min-h-[120px]",
          isOver ? "bg-serva-green-pale/50 ring-2 ring-serva-green/30 ring-dashed" : ""
        )}
      >
        <SortableContext items={cotizaciones.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {cotizaciones.map((c) => (
              <CotizacionCard key={c.id} cotizacion={c} onClick={() => onCardClick(c)} />
            ))}
          </div>
        </SortableContext>

        {cotizaciones.length === 0 && (
          <div className="flex flex-col items-center justify-center h-20 text-gray-300">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-1.5">
              <span className="text-lg leading-none">+</span>
            </div>
            <p className="text-xs">Sin cotizaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}
