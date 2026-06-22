"use client";
import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Cotizacion, EstadoCotizacion } from "@/lib/types";
import { useCotizacionStore } from "@/lib/store";
import KanbanColumn from "./KanbanColumn";
import CotizacionCard from "@/components/cotizaciones/CotizacionCard";
import { Clock, Send, CheckCircle, XCircle } from "lucide-react";

interface Props {
  cotizaciones: Cotizacion[];
  onCardClick: (c: Cotizacion) => void;
}

const COLUMNS: {
  id: EstadoCotizacion;
  title: string;
  color: string;
  headerBg: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "pendiente",
    title: "Pendiente",
    color: "text-amber-700",
    headerBg: "bg-amber-50 border border-amber-200",
    icon: <Clock size={15} />,
  },
  {
    id: "enviada",
    title: "Generada / Enviada",
    color: "text-blue-700",
    headerBg: "bg-blue-50 border border-blue-200",
    icon: <Send size={15} />,
  },
  {
    id: "aprobada",
    title: "Aprobada",
    color: "text-serva-green",
    headerBg: "bg-serva-green-pale border border-serva-green/20",
    icon: <CheckCircle size={15} />,
  },
  {
    id: "rechazada",
    title: "Rechazada / Perdida",
    color: "text-red-600",
    headerBg: "bg-red-50 border border-red-200",
    icon: <XCircle size={15} />,
  },
];

export default function KanbanBoard({ cotizaciones, onCardClick }: Props) {
  const { moverEstado } = useCotizacionStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const grouped = useMemo(() => {
    const map: Record<EstadoCotizacion, Cotizacion[]> = {
      pendiente: [],
      enviada: [],
      aprobada: [],
      rechazada: [],
    };
    cotizaciones.forEach((c) => {
      map[c.estado].push(c);
    });
    return map;
  }, [cotizaciones]);

  const activeCard = activeId ? cotizaciones.find((c) => c.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeCard = cotizaciones.find((c) => c.id === active.id);
    if (!activeCard) return;

    const overColumn = COLUMNS.find((col) => col.id === over.id);
    if (overColumn && activeCard.estado !== overColumn.id) {
      moverEstado(activeCard.id, overColumn.id);
      return;
    }

    const overCard = cotizaciones.find((c) => c.id === over.id);
    if (overCard && activeCard.estado !== overCard.estado) {
      moverEstado(activeCard.id, overCard.estado);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 overflow-x-auto pb-4 px-1">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-[300px]">
            <KanbanColumn
              {...col}
              cotizaciones={grouped[col.id]}
              onCardClick={onCardClick}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeCard && (
          <div className="rotate-2 shadow-2xl opacity-95">
            <CotizacionCard cotizacion={activeCard} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
