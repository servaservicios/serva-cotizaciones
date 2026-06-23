"use client";
import { useMemo } from "react";
import { Cotizacion } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Clock, Send, CheckCircle, XCircle, DollarSign, TrendingUp } from "lucide-react";

interface Props { cotizaciones: Cotizacion[]; }

const PIE_COLORS = ["#F59E0B", "#3B82F6", "#2D7A4F", "#EF4444"];
const BAR_COLORS = ["#2D7A4F", "#3DA066", "#5CB88A", "#87CEAD", "#B3E0CA", "#C5E8D5"];

export default function DashboardView({ cotizaciones }: Props) {
  const s = useMemo(() => {
    const pendientes  = cotizaciones.filter((c) => c.estado === "pendiente");
    const enviadas    = cotizaciones.filter((c) => c.estado === "enviada");
    const aprobadas   = cotizaciones.filter((c) => c.estado === "aprobada");
    const rechazadas  = cotizaciones.filter((c) => c.estado === "rechazada");

    const montoTotal    = cotizaciones.reduce((s, c) => s + c.monto, 0);
    const montoAprobado = aprobadas.reduce((s, c) => s + c.monto, 0);
    const cerradas      = aprobadas.length + rechazadas.length;
    const tasaConv      = cerradas > 0 ? Math.round((aprobadas.length / cerradas) * 100) : 0;
    const ticketProm    = cotizaciones.length > 0 ? Math.round(montoTotal / cotizaciones.length) : 0;

    const clienteMap: Record<string, number> = {};
    cotizaciones.forEach((c) => { clienteMap[c.cliente] = (clienteMap[c.cliente] || 0) + c.monto; });
    const topClientes = Object.entries(clienteMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, value }));

    const categoriaMap: Record<string, number> = {};
    cotizaciones.forEach((c) => { categoriaMap[c.categoria] = (categoriaMap[c.categoria] || 0) + 1; });
    const topServicios = Object.entries(categoriaMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 11)
      .map(([name, value]) => ({ name, value }));

    const proveedorMap: Record<string, number> = {};
    cotizaciones.forEach((c) => { proveedorMap[c.proveedor] = (proveedorMap[c.proveedor] || 0) + 1; });
    const topProveedores = Object.entries(proveedorMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    const pieData = [
      { name: "Pendientes", value: pendientes.length },
      { name: "Enviadas",   value: enviadas.length },
      { name: "Aprobadas",  value: aprobadas.length },
      { name: "Rechazadas", value: rechazadas.length },
    ].filter((d) => d.value > 0);

    return {
      pendientes: pendientes.length, enviadas: enviadas.length,
      aprobadas: aprobadas.length, rechazadas: rechazadas.length,
      montoTotal, montoAprobado, tasaConv, ticketProm,
      topClientes, topServicios, topProveedores, pieData,
    };
  }, [cotizaciones]);

  return (
    <div className="space-y-4">

      {/* ── KPIs top 4 (conteos) ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={<Clock size={18} />}       label="Pendientes" value={s.pendientes} color="amber" />
        <KpiCard icon={<Send size={18} />}         label="Enviadas"   value={s.enviadas}   color="blue" />
        <KpiCard icon={<CheckCircle size={18} />}  label="Aprobadas"  value={s.aprobadas}  color="green" />
        <KpiCard icon={<XCircle size={18} />}      label="Rechazadas" value={s.rechazadas} color="red" />
      </div>

      {/* ── KPIs montos ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard icon={<DollarSign size={18} />}  label="Monto Total"    value={formatCurrency(s.montoTotal)}    color="green"  wide />
        <KpiCard icon={<TrendingUp size={18} />}  label="Monto Aprobado" value={formatCurrency(s.montoAprobado)} color="emerald" wide />
      </div>

      {/* ── Pie ────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Distribución</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={s.pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
              {s.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => [`${v} cots.`, ""]} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

/* ── KPI card ─────────────────────────────────────────── */
const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
  amber:   { bg: "bg-amber-50",        icon: "text-amber-500",  text: "text-amber-700" },
  blue:    { bg: "bg-blue-50",         icon: "text-blue-500",   text: "text-blue-700" },
  green:   { bg: "bg-serva-green-pale",icon: "text-serva-green",text: "text-serva-green-dark" },
  red:     { bg: "bg-red-50",          icon: "text-red-400",    text: "text-red-600" },
  emerald: { bg: "bg-emerald-50",      icon: "text-emerald-500",text: "text-emerald-700" },
  purple:  { bg: "bg-purple-50",       icon: "text-purple-500", text: "text-purple-700" },
  teal:    { bg: "bg-teal-50",         icon: "text-teal-500",   text: "text-teal-700" },
};

function KpiCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; wide?: boolean;
}) {
  const c = colorMap[color] ?? colorMap.green;
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
        <div className={cn("p-1.5 rounded-lg flex-shrink-0", c.bg)}>
          <span className={c.icon}>{icon}</span>
        </div>
      </div>
      <p className={cn("text-xl font-black leading-none", c.text)}>{value}</p>
    </div>
  );
}
