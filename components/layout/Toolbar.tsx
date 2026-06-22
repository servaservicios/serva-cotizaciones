"use client";
import { Search, SlidersHorizontal, X } from "lucide-react";
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
  total: number;
}

export default function Toolbar({ filters, onFilterChange, total }: Props) {
  const [showFilters, setShowFilters] = useState(false);

  const set = (key: keyof FilterState, value: string) =>
    onFilterChange({ ...filters, [key]: value });

  const clearAll = () =>
    onFilterChange({ search: "", estado: "", responsable: "", categoria: "", prioridad: "" });

  const activeCount = [filters.estado, filters.responsable, filters.categoria, filters.prioridad]
    .filter(Boolean).length;

  const sel = "w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-serva-green/30 focus:border-serva-green appearance-none";

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm sticky top-14 sm:top-16 z-30">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              inputMode="search"
              placeholder="Buscar…"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-serva-green/30 focus:border-serva-green placeholder:text-gray-400 bg-white"
            />
            {filters.search && (
              <button
                onClick={() => set("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 tap-target flex items-center justify-center"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all flex-shrink-0 tap-target",
              showFilters || activeCount > 0
                ? "border-serva-green bg-serva-green-pale text-serva-green"
                : "border-gray-200 text-gray-600"
            )}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filtros</span>
            {activeCount > 0 && (
              <span className="bg-serva-green text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter pills */}
        {showFilters && (
          <div className="mt-2.5 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select value={filters.estado} onChange={(e) => set("estado", e.target.value)} className={sel}>
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="enviada">Enviada</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
              <select value={filters.responsable} onChange={(e) => set("responsable", e.target.value)} className={sel}>
                <option value="">Responsable</option>
                {RESPONSABLES.map((r) => <option key={r} value={r}>{r.split(" ")[0]}</option>)}
              </select>
              <select value={filters.categoria} onChange={(e) => set("categoria", e.target.value)} className={sel}>
                <option value="">Categoría</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filters.prioridad} onChange={(e) => set("prioridad", e.target.value)} className={sel}>
                <option value="">Prioridad</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-red-400 font-semibold flex items-center gap-1 tap-target py-1">
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Result count */}
        <p className="text-[11px] text-gray-400 mt-1.5">
          {total} resultado{total !== 1 ? "s" : ""}
          {activeCount > 0 ? ` con ${activeCount} filtro${activeCount > 1 ? "s" : ""}` : ""}
        </p>
      </div>
    </div>
  );
}
