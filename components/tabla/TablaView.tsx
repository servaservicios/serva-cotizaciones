"use client";
import { useState } from "react";
import { Cotizacion, ESTADOS } from "@/lib/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, ChevronRight } from "lucide-react";

interface Props {
  cotizaciones: Cotizacion[];
  onRowClick: (c: Cotizacion) => void;
}

type SortField = "cliente" | "monto" | "fechaSolicitud" | "prioridad" | "estado";
type SortDir = "asc" | "desc";

const estadoStyle: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  enviada:   "bg-blue-100 text-blue-800",
  aprobada:  "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
};

const prioridadDot: Record<string, string> = {
  Alta: "bg-red-500", Media: "bg-amber-400", Baja: "bg-gray-300",
};

const prioridadOrder: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };

export default function TablaView({ cotizaciones, onRowClick }: Props) {
  const [sortField, setSortField] = useState<SortField>("fechaSolicitud");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const sorted = [...cotizaciones].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "cliente":       cmp = a.cliente.localeCompare(b.cliente); break;
      case "monto":         cmp = a.monto - b.monto; break;
      case "fechaSolicitud":cmp = new Date(a.fechaSolicitud).getTime() - new Date(b.fechaSolicitud).getTime(); break;
      case "prioridad":     cmp = prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad]; break;
      case "estado":        cmp = a.estado.localeCompare(b.estado); break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-gray-300" />;
    return sortDir === "asc"
      ? <ArrowUp size={12} className="text-serva-green" />
      : <ArrowDown size={12} className="text-serva-green" />;
  };

  return (
    <div className="space-y-3">

      {/* ── MOBILE: card list ─────────────────────────── */}
      <div className="sm:hidden space-y-2">
        {/* Sort bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs text-gray-400 font-medium flex-shrink-0">Ordenar:</span>
          {(["fechaSolicitud", "monto", "cliente", "prioridad"] as SortField[]).map((f) => {
            const labels: Record<string, string> = { fechaSolicitud: "Fecha", monto: "Monto", cliente: "Cliente", prioridad: "Prioridad" };
            const active = sortField === f;
            return (
              <button
                key={f}
                onClick={() => toggleSort(f)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 border tap-target",
                  active ? "bg-serva-green text-white border-serva-green" : "bg-white text-gray-500 border-gray-200"
                )}
              >
                {labels[f]}
                <SortIcon field={f} />
              </button>
            );
          })}
        </div>

        {/* Cards */}
        {sorted.map((c) => (
          <button
            key={c.id}
            onClick={() => onRowClick(c)}
            className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:bg-gray-50 transition-colors tap-target"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", prioridadDot[c.prioridad])} />
                  <span className="text-[11px] text-gray-400">{c.numeroCotizacion}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{c.nombreServicio}</p>
              </div>
              <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0", estadoStyle[c.estado])}>
                {ESTADOS[c.estado].label}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-2">{c.cliente}</p>
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-serva-green">
                {c.monto > 0 ? formatCurrency(c.monto) : "Sin monto"}
              </span>
              <div className="flex items-center gap-2">
                {c.enlaceSheets && (
                  <a
                    href={c.enlaceSheets}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-serva-green-pale text-serva-green flex items-center justify-center"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
                <span className="text-[11px] text-gray-400">{formatDate(c.fechaSolicitud)}</span>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </div>
          </button>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Sin resultados</p>
          </div>
        )}
      </div>

      {/* ── DESKTOP: table ────────────────────────────── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Servicio</th>
                {(["cliente", "monto", "estado", "prioridad", "fechaSolicitud"] as SortField[]).map((f) => {
                  const labels: Record<string, string> = { cliente: "Cliente", monto: "Monto", estado: "Estado", prioridad: "Prioridad", fechaSolicitud: "Fecha Sol." };
                  return (
                    <th key={f} onClick={() => toggleSort(f)} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-serva-green select-none whitespace-nowrap">
                      <div className="flex items-center gap-1.5">{labels[f]}<SortIcon field={f} /></div>
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsable</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">%</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Sheets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((c) => (
                <tr key={c.id} onClick={() => onRowClick(c)} className="table-row-hover cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-gray-400 whitespace-nowrap">{c.numeroCotizacion}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 line-clamp-1 max-w-[180px]">{c.nombreServicio}</p>
                    <p className="text-xs text-gray-400">{c.categoria}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap max-w-[160px] truncate">{c.cliente}</td>
                  <td className="px-4 py-3 font-bold text-serva-green whitespace-nowrap">
                    {c.monto > 0 ? formatCurrency(c.monto) : <span className="text-gray-300 font-normal">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", estadoStyle[c.estado])}>
                      {ESTADOS[c.estado].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full", prioridadDot[c.prioridad])} />
                      <span className="text-xs text-gray-600">{c.prioridad}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(c.fechaSolicitud)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{c.responsable.split(" ")[0]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-serva-green rounded-full" style={{ width: `${c.probabilidadCierre}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{c.probabilidadCierre}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.enlaceSheets ? (
                      <a href={c.enlaceSheets} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-serva-green-pale text-serva-green hover:bg-serva-green-mid transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    ) : <span className="text-gray-200">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="text-center py-16 text-gray-400"><p className="text-sm">Sin resultados</p></div>
          )}
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">{sorted.length} cotización{sorted.length !== 1 ? "es" : ""}</p>
          <p className="text-xs font-bold text-serva-green">Total: {formatCurrency(sorted.reduce((s, c) => s + c.monto, 0))}</p>
        </div>
      </div>

      {/* Mobile total footer */}
      <div className="sm:hidden flex items-center justify-between px-1">
        <p className="text-xs text-gray-400">{sorted.length} cotización{sorted.length !== 1 ? "es" : ""}</p>
        <p className="text-xs font-bold text-serva-green">Total: {formatCurrency(sorted.reduce((s, c) => s + c.monto, 0))}</p>
      </div>
    </div>
  );
}
