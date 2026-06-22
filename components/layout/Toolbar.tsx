"use client";
import { Search, Plus, Filter, X, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import { CATEGORIAS, RESPONSABLES } from "@/lib/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterState {
  search: string;
  estado: string;
  responsable: string;
  categoria: string;
  prioridad: string;
}

interface Props {
  filters: FilterState;
  onFilterChange: (f: FilterState) => void;
  onNuevaCotizacion: () => void;
  total: number;
}

export default function Toolbar({ filters, onFilterChange, onNuevaCotizacion, total }: Props) {
  const [showFilters, setShowFilters] = useState(false);

  const set = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFilterChange({ search: "", estado: "", responsable: "", categoria: "", prioridad: "" });
  };

  const activeFiltersCount = [
    filters.estado, filters.responsable, filters.categoria, filters.prioridad
  ].filter(Boolean).length;

  const selectClass = "border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-serva-green/30 focus:border-serva-green appearance-none";

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-30">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente, servicio, proveedor…"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-serva-green/30 focus:border-serva-green placeholder:text-gray-400"
            />
            {filters.search && (
              <button
                onClick={() => set("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
              showFilters || activeFiltersCount > 0
                ? "border-serva-green bg-serva-green-pale text-serva-green"
                : "border-gray-200 text-gray-600 hover:border-serva-green/50 hover:text-serva-green"
            )}
          >
            <SlidersHorizontal size={14} />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-serva-green text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X size={12} />
              Limpiar
            </button>
          )}

          <div className="flex-1" />

          <p className="text-xs text-gray-400 hidden sm:block">
            {total} resultado{total !== 1 ? "s" : ""}
          </p>

          <Button onClick={onNuevaCotizacion} size="md">
            <Plus size={16} />
            Nueva cotización
          </Button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <select
              value={filters.estado}
              onChange={(e) => set("estado", e.target.value)}
              className={selectClass}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>

            <select
              value={filters.responsable}
              onChange={(e) => set("responsable", e.target.value)}
              className={selectClass}
            >
              <option value="">Todos los responsables</option>
              {RESPONSABLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={filters.categoria}
              onChange={(e) => set("categoria", e.target.value)}
              className={selectClass}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filters.prioridad}
              onChange={(e) => set("prioridad", e.target.value)}
              className={selectClass}
            >
              <option value="">Todas las prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
