"use client";
import { useMemo } from "react";
import { Cotizacion } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Clock, Send, CheckCircle, XCircle, TrendingUp, DollarSign,
  Percent, BarChart2
} from "lucide-react";

interface Props {
  cotizaciones: Cotizacion[];
}

const COLORS = ["#2D7A4F", "#3DA066", "#5CB88A", "#87CEAD", "#B3E0CA", "#D6F0E4", "#E8F5EE"];
const PIE_COLORS = ["#F59E0B", "#3B82F6", "#2D7A4F", "#EF4444"];

export default function DashboardView({ cotizaciones }: Props) {
  const stats = useMemo(() => {
    const pendientes = cotizaciones.filter((c) => c.estado === "pendiente");
    const enviadas = cotizaciones.filter((c) => c.estado === "enviada");
    const aprobadas = cotizaciones.filter((c) => c.estado === "aprobada");
    const rechazadas = cotizaciones.filter((c) => c.estado === "rechazada");

    const montoTotal = cotizaciones.reduce((s, c) => s + c.monto, 0);
    const montoAprobado = aprobadas.reduce((s, c) => s + c.monto, 0);
    const cerradas = aprobadas.length + rechazadas.length;
    const tasaConversion = cerradas > 0 ? Math.round((aprobadas.length / cerradas) * 100) : 0;
    const ticketPromedio = cotizaciones.length > 0 ? Math.round(montoTotal / cotizaciones.length) : 0;

    // Top 10 clientes
    const clienteMap: Record<string, number> = {};
    cotizaciones.forEach((c) => {
      clienteMap[c.cliente] = (clienteMap[c.cliente] || 0) + c.monto;
    });
    const topClientes = Object.entries(clienteMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + "…" : name, value }));

    // Top 10 servicios
    const servicioMap: Record<string, number> = {};
    cotizaciones.forEach((c) => {
      servicioMap[c.nombreServicio] = (servicioMap[c.nombreServicio] || 0) + 1;
    });
    const topServicios = Object.entries(servicioMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name: name.length > 22 ? name.slice(0, 20) + "…" : name, value }));

    // Top proveedores
    const proveedorMap: Record<string, number> = {};
    cotizaciones.forEach((c) => {
      proveedorMap[c.proveedor] = (proveedorMap[c.proveedor] || 0) + 1;
    });
    const topProveedores = Object.entries(proveedorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    // Distribución por estado para pie
    const pieData = [
      { name: "Pendientes", value: pendientes.length },
      { name: "Enviadas", value: enviadas.length },
      { name: "Aprobadas", value: aprobadas.length },
      { name: "Rechazadas", value: rechazadas.length },
    ].filter((d) => d.value > 0);

    return {
      pendientes: pendientes.length,
      enviadas: enviadas.length,
      aprobadas: aprobadas.length,
      rechazadas: rechazadas.length,
      montoTotal,
      montoAprobado,
      tasaConversion,
      ticketPromedio,
      topClientes,
      topServicios,
      topProveedores,
      pieData,
    };
  }, [cotizaciones]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Clock size={20} />}
          label="Pendientes"
          value={stats.pendientes}
          color="amber"
        />
        <KpiCard
          icon={<Send size={20} />}
          label="Enviadas"
          value={stats.enviadas}
          color="blue"
        />
        <KpiCard
          icon={<CheckCircle size={20} />}
          label="Aprobadas"
          value={stats.aprobadas}
          color="green"
        />
        <KpiCard
          icon={<XCircle size={20} />}
          label="Rechazadas"
          value={stats.rechazadas}
          color="red"
        />
        <KpiCard
          icon={<DollarSign size={20} />}
          label="Monto Total"
          value={formatCurrency(stats.montoTotal)}
          color="green"
          wide
        />
        <KpiCard
          icon={<TrendingUp size={20} />}
          label="Monto Aprobado"
          value={formatCurrency(stats.montoAprobado)}
          color="emerald"
          wide
        />
        <KpiCard
          icon={<Percent size={20} />}
          label="Tasa de Conversión"
          value={`${stats.tasaConversion}%`}
          color="purple"
          wide
        />
        <KpiCard
          icon={<BarChart2 size={20} />}
          label="Ticket Promedio"
          value={formatCurrency(stats.ticketPromedio)}
          color="teal"
          wide
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Distribución pie */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Distribución por Estado</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {stats.pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} cots.`, ""]} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top clientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Top 10 Clientes por Monto</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.topClientes} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Monto"]} />
              <Bar dataKey="value" fill="#2D7A4F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top servicios */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Top 10 Servicios Más Cotizados</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.topServicios} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={150}
              />
              <Tooltip formatter={(value: number) => [`${value} cotizaciones`, ""]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {stats.topServicios.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top proveedores */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Top Proveedores Utilizados</h3>
          <div className="space-y-3 mt-2">
            {stats.topProveedores.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate">{p.name}</span>
                    <span className="text-xs font-bold text-serva-green ml-2">
                      {p.value} cot{p.value !== 1 ? "s" : "."}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-serva-green rounded-full transition-all"
                      style={{
                        width: `${(p.value / Math.max(...stats.topProveedores.map((x) => x.value))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {stats.topProveedores.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Sin datos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  wide?: boolean;
}

const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
  amber: { bg: "bg-amber-50", icon: "text-amber-500", text: "text-amber-700" },
  blue: { bg: "bg-blue-50", icon: "text-blue-500", text: "text-blue-700" },
  green: { bg: "bg-serva-green-pale", icon: "text-serva-green", text: "text-serva-green-dark" },
  red: { bg: "bg-red-50", icon: "text-red-400", text: "text-red-600" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", text: "text-emerald-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", text: "text-purple-700" },
  teal: { bg: "bg-teal-50", icon: "text-teal-500", text: "text-teal-700" },
};

function KpiCard({ icon, label, value, color }: KpiCardProps) {
  const c = colorMap[color] ?? colorMap.green;
  return (
    <div className={cn("rounded-2xl p-5 border border-gray-100 shadow-sm bg-white")}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
        <div className={cn("p-2 rounded-lg", c.bg)}>
          <span className={c.icon}>{icon}</span>
        </div>
      </div>
      <p className={cn("text-2xl font-bold", c.text)}>{value}</p>
    </div>
  );
}
