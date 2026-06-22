"use client";
import { useState } from "react";
import { Cotizacion, ESTADOS } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface Props {
  cotizaciones: Cotizacion[];
  onRowClick: (c: Cotizacion) => void;
}

type SortField = "cliente" | "monto" | "fechaSolicitud" | "prioridad" | "estado";
type SortDir = "asc" | "desc";

const estadoVariant: Record<string, "warning" | "info" | "success" | "danger"> = {
  pendiente: "warning",
  enviada: "info",
  aprobada: "success",
  rechazada: "danger",
};

const prioridadOrder: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };

export default function TablaView({ cotizaciones, onRowClick }: Props) {
  const [sortField, setSortField] = useState<SortField>("fechaSolicitud");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...cotizaciones].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "cliente":
        cmp = a.cliente.localeCompare(b.cliente);
        break;
      case "monto":
        cmp = a.monto - b.monto;
        break;
      case "fechaSolicitud":
        cmp = new Date(a.fechaSolicitud).getTime() - new Date(b.fechaSolicitud).getTime();
        break;
      case "prioridad":
        cmp = prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
        break;
      case "estado":
        cmp = a.estado.localeCompare(b.estado);
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={13} className="text-gray-300" />;
    return sortDir === "asc" ? (
      <ArrowUp size={13} className="text-serva-green" />
    ) : (
      <ArrowDown size={13} className="text-serva-green" />
    );
  };

  const th = (label: string, field: SortField) => (
    <th
      key={field}
      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-serva-green select-none whitespace-nowrap"
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon field={field} />
      </div>
    </th>
  );

  const prioridadDot: Record<string, string> = {
    Alta: "bg-red-500",
    Media: "bg-amber-400",
    Baja: "bg-gray-400",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                # Cot.
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              {th("Cliente", "cliente")}
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              {th("Monto", "monto")}
              {th("Estado", "estado")}
              {th("Prioridad", "prioridad")}
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Responsable
              </th>
              {th("Fecha Sol.", "fechaSolicitud")}
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                %
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Sheets
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((c) => (
              <tr
                key={c.id}
                onClick={() => onRowClick(c)}
                className="table-row-hover cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-xs font-medium text-gray-400 whitespace-nowrap">
                  {c.numeroCotizacion}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800 line-clamp-1 max-w-[180px]">
                    {c.nombreServicio}
                  </p>
                  <p className="text-xs text-gray-400">{c.categoria}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-700 whitespace-nowrap max-w-[160px] truncate">
                    {c.cliente}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap max-w-[140px] truncate">
                  {c.proveedor}
                </td>
                <td className="px-4 py-3 font-bold text-serva-green whitespace-nowrap">
                  {formatCurrency(c.monto)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={estadoVariant[c.estado]}>
                    {ESTADOS[c.estado].label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${prioridadDot[c.prioridad]}`} />
                    <span className="text-xs text-gray-600">{c.prioridad}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                  {c.responsable.split(" ")[0]}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(c.fechaSolicitud)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-serva-green rounded-full"
                        style={{ width: `${c.probabilidadCierre}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{c.probabilidadCierre}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {c.enlaceSheets ? (
                    <a
                      href={c.enlaceSheets}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-serva-green-pale text-serva-green hover:bg-serva-green-mid transition-colors inline-flex"
                      title="Abrir Sheets"
                    >
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No se encontraron cotizaciones</p>
          </div>
        )}
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {sorted.length} cotización{sorted.length !== 1 ? "es" : ""}
        </p>
        <p className="text-xs font-bold text-serva-green">
          Total: {formatCurrency(sorted.reduce((s, c) => s + c.monto, 0))}
        </p>
      </div>
    </div>
  );
}
