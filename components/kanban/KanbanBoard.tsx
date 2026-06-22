"use client";
import { useState, useMemo } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  MouseSensor, TouchSensor, useSensor, useSensors, closestCorners,
} from "@dnd-kit/core";
import { Cotizacion, EstadoCotizacion } from "@/lib/types";
import { useCotizacionStore } from "@/lib/store";
import KanbanColumn from "./KanbanColumn";
import CotizacionCard from "@/components/cotizaciones/CotizacionCard";
import { Clock, Send, CheckCircle, XCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Props {
  cotizaciones: Cotizacion[];
  onCardClick: (c: Cotizacion) => void;
}

const COLUMNS: {
  id: EstadoCotizacion;
  title: string;
  shortTitle: string;
  color: string;
  headerBg: string;
  activeTab: string;
  icon: React.ReactNode;
}[] = [
  { id: "pendiente",  title: "Pendiente",          shortTitle: "Pendiente",  color: "text-amber-700",    headerBg: "bg-amber-50 border border-amber-200",          activeTab: "bg-amber-500",   icon: <Clock size={15} /> },
  { id: "enviada",    title: "Generada / Enviada",  shortTitle: "Enviada",    color: "text-blue-700",     headerBg: "bg-blue-50 border border-blue-200",            activeTab: "bg-blue-500",    icon: <Send size={15} /> },
  { id: "aprobada",   title: "Aprobada",            shortTitle: "Aprobada",   color: "text-serva-green",  headerBg: "bg-serva-green-pale border border-serva-green/20", activeTab: "bg-serva-green", icon: <CheckCircle size={15} /> },
  { id: "rechazada",  title: "Rechazada / Perdida", shortTitle: "Rechazada",  color: "text-red-600",      headerBg: "bg-red-50 border border-red-200",              activeTab: "bg-red-500",     icon: <XCircle size={15} /> },
];

export default function KanbanBoard({ cotizaciones, onCardClick }: Props) {
  const { moverEstado } = useCotizacionStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<EstadoCotizacion>("pendiente");

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  );

  const grouped = useMemo(() => {
    const map: Record<EstadoCotizacion, Cotizacion[]> = {
      pendiente: [], enviada: [], aprobada: [], rechazada: [],
    };
    cotizaciones.forEach((c) => map[c.estado].push(c));
    return map;
  }, [cotizaciones]);

  const activeCard = activeId ? cotizaciones.find((c) => c.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const card = cotizaciones.find((c) => c.id === active.id);
    if (!card) return;
    const overCol = COLUMNS.find((col) => col.id === over.id);
    if (overCol && card.estado !== overCol.id) { moverEstado(card.id, overCol.id); return; }
    const overCard = cotizaciones.find((c) => c.id === over.id);
    if (overCard && card.estado !== overCard.estado) moverEstado(card.id, overCard.estado);
  };

  const activeCol = COLUMNS.find((c) => c.id === mobileTab)!;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* ── DESKTOP: horizontal 4-column layout ─────────────── */}
      <div className="hidden sm:flex gap-5 overflow-x-auto pb-4 px-1 items-start">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-[300px] flex flex-col">
            <KanbanColumn {...col} cotizaciones={grouped[col.id]} onCardClick={onCardClick} />
          </div>
        ))}
      </div>

      {/* ── MOBILE: tab switcher + single column ─────────────── */}
      <div className="sm:hidden">
        {/* Tab pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-3">
          {COLUMNS.map((col) => {
            const count = grouped[col.id].length;
            const isActive = mobileTab === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setMobileTab(col.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all tap-target border",
                  isActive
                    ? "bg-serva-green text-white border-serva-green shadow-sm"
                    : "bg-white text-gray-500 border-gray-200"
                )}
              >
                {col.icon}
                {col.shortTitle}
                <span className={cn(
                  "rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Column summary */}
        <div className={cn("rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between", activeCol.headerBg)}>
          <div className="flex items-center gap-2">
            <span className={activeCol.color}>{activeCol.icon}</span>
            <span className={cn("text-sm font-bold", activeCol.color)}>{activeCol.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium opacity-70", activeCol.color)}>
              {grouped[mobileTab].length > 0
                ? formatCurrency(grouped[mobileTab].reduce((s, c) => s + c.monto, 0))
                : "Sin monto"}
            </span>
          </div>
        </div>

        {/* Cards for active tab */}
        <div className="space-y-3">
          {grouped[mobileTab].map((c) => (
            <CotizacionCard key={c.id} cotizacion={c} onClick={() => onCardClick(c)} />
          ))}
          {grouped[mobileTab].length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-3">
                <span className="text-2xl">+</span>
              </div>
              <p className="text-sm font-medium">Sin cotizaciones aquí</p>
              <p className="text-xs mt-1">Toca el botón + para agregar</p>
            </div>
          )}
        </div>

        {/* Mobile quick-move: shown inside card detail, not here */}
      </div>

      <DragOverlay>
        {activeCard && (
          <div className="rotate-2 shadow-2xl opacity-90 w-[290px]">
            <CotizacionCard cotizacion={activeCard} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
