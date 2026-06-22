"use client";
import { useMemo } from "react";
import { Cotizacion } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Clock, Send, CheckCircle, XCircle, DollarSign, TrendingUp, Percent, BarChart2 } from "lucide-react";

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

    const servicioMap: Record<string, number> = {};
    cotizaciones.forEach((c) => { servicioMap[c.nombreServicio] = (servicioMap[c.nombreServicio] || 0) + 1; });
    const topServicios = Object.entries(servicioMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + "…" : name, value }));

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={<DollarSign size={18} />}  label="Monto Total"      value={formatCurrency(s.montoTotal)}    color="green"  wide />
        <KpiCard icon={<TrendingUp size={18} />}  label="Monto Aprobado"   value={formatCurrency(s.montoAprobado)} color="emerald" wide />
        <KpiCard icon={<Percent size={18} />}     label="Conversión"       value={`${s.tasaConv}%`}                color="purple" wide />
        <KpiCard icon={<BarChart2 size={18} />}   label="Ticket Promedio"  value={formatCurrency(s.ticketProm)}   color="teal"   wide />
      </div>

      {/* ── Pie + Proveedores ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Top Proveedores</h3>
          <div className="space-y-2.5">
            {s.topProveedores.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-gray-300 w-4 text-right flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-gray-700 truncate">{p.name}</span>
                    <span className="text-xs font-bold text-serva-green ml-1 flex-shrink-0">{p.value}</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-serva-green rounded-full"
                      style={{ width: `${(p.value / Math.max(...s.topProveedores.map((x) => x.value))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {s.topProveedores.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>}
          </div>
        </div>
      </div>

      {/* ── Top Clientes ─────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Top Clientes por Monto</h3>
        <ResponsiveContainer width="100%" height={Math.max(180, s.topClientes.length * 28)}>
          <BarChart data={s.topClientes} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis
              type="number"
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category" dataKey="name"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false} tickLine={false} width={120}
            />
            <Tooltip formatter={(v: number) => [formatCurrency(v), "Monto"]} />
            <Bar dataKey="value" fill="#2D7A4F" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Top Servicios ────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Servicios más Cotizados</h3>
        <ResponsiveContainer width="100%" height={Math.max(180, s.topServicios.length * 28)}>
          <BarChart data={s.topServicios} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis
              type="number" allowDecimals={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category" dataKey="name"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false} tickLine={false} width={140}
            />
            <Tooltip formatter={(v: number) => [`${v} cotizaciones`, ""]} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {s.topServicios.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
            </Bar>
          </BarChart>
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
