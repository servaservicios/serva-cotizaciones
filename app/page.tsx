"use client";
import { useState, useMemo, useEffect } from "react";
import { useCotizacionStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Cotizacion, Cliente } from "@/lib/types";
import { fetchClientes } from "@/lib/clientesService";
import Navbar from "@/components/layout/Navbar";
import Toolbar from "@/components/layout/Toolbar";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import TablaView from "@/components/tabla/TablaView";
import DashboardView from "@/components/dashboard/DashboardView";
import ClientesView, { clientesBadgeCount } from "@/components/clientes/ClientesView";
import Modal from "@/components/ui/Modal";
import CotizacionForm from "@/components/cotizaciones/CotizacionForm";
import CotizacionDetail from "@/components/cotizaciones/CotizacionDetail";
import { AlertTriangle, RefreshCw, Loader2, Database, WifiOff, Plus } from "lucide-react";

type View = "dashboard" | "kanban" | "tabla" | "clientes";

interface FilterState {
  search: string;
  estado: string;
  responsable: string;
  categoria: string;
  prioridad: string;
}

export default function Home() {
  const {
    cotizaciones, loading, error, initialized, realtimeStatus,
    fetchCotizaciones, clearError, subscribeToRealtime,
  } = useCotizacionStore();

  const [view, setView] = useState<View>("kanban");
  const [filters, setFilters] = useState<FilterState>({
    search: "", estado: "", responsable: "", categoria: "", prioridad: "",
  });
  const [modalCreate, setModalCreate] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Cotizacion | null>(null);
  const [editingCard, setEditingCard] = useState<Cotizacion | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    if (!initialized) fetchCotizaciones();
    const unsubscribe = subscribeToRealtime();
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchClientes().then(({ data }) => setClientes(data));
  }, []);

  const filtered = useMemo(() => {
    return cotizaciones.filter((c) => {
      const q = filters.search.toLowerCase();
      if (q &&
        !c.cliente.toLowerCase().includes(q) &&
        !c.nombreServicio.toLowerCase().includes(q) &&
        !c.proveedor.toLowerCase().includes(q) &&
        !c.numeroCotizacion.toLowerCase().includes(q)
      ) return false;
      if (filters.estado && c.estado !== filters.estado) return false;
      if (filters.responsable && c.responsable !== filters.responsable) return false;
      if (filters.categoria && c.categoria !== filters.categoria) return false;
      if (filters.prioridad && c.prioridad !== filters.prioridad) return false;
      return true;
    });
  }, [cotizaciones, filters]);

  const badge = useMemo(() => clientesBadgeCount(clientes), [clientes]);

  const handleCardClick = (c: Cotizacion) => setSelectedCard(c);
  const handleEdit = () => { setEditingCard(selectedCard); setSelectedCard(null); };
  const handleEditClose = () => setEditingCard(null);

  const RealtimeBadge = () => {
    if (!isSupabaseConfigured) return null;
    if (realtimeStatus === "connected") return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        En vivo
      </div>
    );
    if (realtimeStatus === "connecting") return (
      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
        <Loader2 size={12} className="animate-spin" /> Conectando…
      </div>
    );
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <WifiOff size={12} /> Sin conexión
      </div>
    );
  };

  if (loading && !initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 bg-serva-green rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-2xl">S</span>
        </div>
        <Loader2 size={24} className="text-serva-green animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Cargando cotizaciones…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeView={view} onViewChange={setView} clientesBadge={badge} />

      {/* Banner: modo local */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-start gap-2 text-xs text-amber-800">
          <Database size={14} className="flex-shrink-0 mt-0.5" />
          <span><strong>Modo local:</strong> Datos de ejemplo. Configura Supabase para persistencia real.</span>
        </div>
      )}

      {/* Banner: error */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between gap-2 text-xs text-red-700">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span className="line-clamp-1">{error}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => fetchCotizaciones()} className="flex items-center gap-1 font-semibold underline tap-target">
              <RefreshCw size={11} /> Reintentar
            </button>
            <button onClick={clearError} className="font-medium tap-target">Cerrar</button>
          </div>
        </div>
      )}

      {/* Toolbar — solo en vistas de cotizaciones */}
      {(view === "kanban" || view === "tabla") && (
        <Toolbar filters={filters} onFilterChange={setFilters} total={filtered.length} />
      )}

      {/* ── Contenido principal ──────────────────────── */}
      <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-safe">

        {view === "dashboard" && (
          <>
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Resumen general de cotizaciones SERVA</p>
              </div>
              <RealtimeBadge />
            </div>
            <DashboardView cotizaciones={cotizaciones} />
          </>
        )}

        {view === "kanban" && (
          <>
            <div className="flex items-center justify-between mb-3 sm:mb-5">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Pipeline</h1>
                <p className="hidden sm:block text-sm text-gray-500 mt-0.5">
                  Arrastra las tarjetas para cambiar estado
                </p>
              </div>
              <RealtimeBadge />
            </div>
            <KanbanBoard cotizaciones={filtered} onCardClick={handleCardClick} />
          </>
        )}

        {view === "tabla" && (
          <>
            <div className="flex items-center justify-between mb-3 sm:mb-5">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Cotizaciones</h1>
                <p className="hidden sm:block text-sm text-gray-500 mt-0.5">Vista de tabla con ordenamiento</p>
              </div>
              <RealtimeBadge />
            </div>
            <TablaView cotizaciones={filtered} onRowClick={handleCardClick} />
          </>
        )}

        {view === "clientes" && (
          <>
            <div className="flex items-center justify-between mb-3 sm:mb-5">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Clientes</h1>
                <p className="hidden sm:block text-sm text-gray-500 mt-0.5">Prospectos y recordatorios de seguimiento</p>
              </div>
            </div>
            <ClientesView />
          </>
        )}
      </main>

      {/* ── FAB móvil (solo en vistas de cotizaciones) ─────── */}
      {view !== "clientes" && (
        <button
          onClick={() => setModalCreate(true)}
          className="sm:hidden fixed z-40 w-14 h-14 bg-serva-green text-white rounded-2xl fab-shadow flex items-center justify-center active:scale-95 transition-transform"
          style={{ bottom: "calc(64px + env(safe-area-inset-bottom, 0px) + 16px)", right: "16px" }}
          aria-label="Nueva cotización"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}

      {/* ── Botón desktop (solo en vistas de cotizaciones) ──── */}
      {view !== "clientes" && (
        <button
          onClick={() => setModalCreate(true)}
          className="hidden sm:flex fixed bottom-6 right-6 z-40 items-center gap-2 px-5 py-3 bg-serva-green text-white rounded-xl font-bold text-sm shadow-lg hover:bg-serva-green-dark transition-colors fab-shadow"
        >
          <Plus size={18} />
          Nueva cotización
        </button>
      )}

      {/* ── Modales ───────────────────────────────────── */}
      <Modal isOpen={modalCreate} onClose={() => setModalCreate(false)} title="Nueva Cotización" size="xl">
        <CotizacionForm onClose={() => setModalCreate(false)} />
      </Modal>

      <Modal isOpen={!!selectedCard} onClose={() => setSelectedCard(null)} title="Cotización" size="xl">
        {selectedCard && (
          <CotizacionDetail cotizacion={selectedCard} onEdit={handleEdit} onClose={() => setSelectedCard(null)} />
        )}
      </Modal>

      <Modal isOpen={!!editingCard} onClose={handleEditClose} title="Editar Cotización" size="xl">
        {editingCard && <CotizacionForm cotizacion={editingCard} onClose={handleEditClose} />}
      </Modal>
    </div>
  );
}
