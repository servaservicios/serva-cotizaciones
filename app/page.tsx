"use client";
import { useState, useMemo, useEffect } from "react";
import { useCotizacionStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Cotizacion } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import Toolbar from "@/components/layout/Toolbar";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import TablaView from "@/components/tabla/TablaView";
import DashboardView from "@/components/dashboard/DashboardView";
import Modal from "@/components/ui/Modal";
import CotizacionForm from "@/components/cotizaciones/CotizacionForm";
import CotizacionDetail from "@/components/cotizaciones/CotizacionDetail";
import { AlertTriangle, RefreshCw, Loader2, Database } from "lucide-react";

type View = "dashboard" | "kanban" | "tabla";

interface FilterState {
  search: string;
  estado: string;
  responsable: string;
  categoria: string;
  prioridad: string;
}

export default function Home() {
  const { cotizaciones, loading, error, initialized, fetchCotizaciones, clearError } =
    useCotizacionStore();
  const [view, setView] = useState<View>("kanban");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    estado: "",
    responsable: "",
    categoria: "",
    prioridad: "",
  });

  // Modals
  const [modalCreate, setModalCreate] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Cotizacion | null>(null);
  const [editingCard, setEditingCard] = useState<Cotizacion | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    if (!initialized) {
      fetchCotizaciones();
    }
  }, [initialized, fetchCotizaciones]);

  const filtered = useMemo(() => {
    return cotizaciones.filter((c) => {
      const q = filters.search.toLowerCase();
      if (
        q &&
        !c.cliente.toLowerCase().includes(q) &&
        !c.nombreServicio.toLowerCase().includes(q) &&
        !c.proveedor.toLowerCase().includes(q) &&
        !c.numeroCotizacion.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (filters.estado && c.estado !== filters.estado) return false;
      if (filters.responsable && c.responsable !== filters.responsable) return false;
      if (filters.categoria && c.categoria !== filters.categoria) return false;
      if (filters.prioridad && c.prioridad !== filters.prioridad) return false;
      return true;
    });
  }, [cotizaciones, filters]);

  const handleCardClick = (c: Cotizacion) => {
    setSelectedCard(c);
  };

  const handleEdit = () => {
    setEditingCard(selectedCard);
    setSelectedCard(null);
  };

  const handleEditClose = () => {
    setEditingCard(null);
  };

  // ── Estado de carga inicial ───────────────────────────────────────────────
  if (loading && !initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-serva-green animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Cargando cotizaciones…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeView={view} onViewChange={setView} />

      {/* Banner: Supabase no configurado */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2 text-sm text-amber-800">
          <Database size={15} className="flex-shrink-0" />
          <span>
            <strong>Modo local:</strong> Supabase no configurado. Los datos son de ejemplo y no se
            guardarán entre sesiones. Consulta el README para conectar Supabase.
          </span>
        </div>
      )}

      {/* Banner de error */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex items-center justify-between gap-2 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchCotizaciones()}
              className="flex items-center gap-1 text-xs font-semibold underline hover:no-underline"
            >
              <RefreshCw size={12} />
              Reintentar
            </button>
            <button
              onClick={clearError}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {view !== "dashboard" && (
        <Toolbar
          filters={filters}
          onFilterChange={setFilters}
          onNuevaCotizacion={() => setModalCreate(true)}
          total={filtered.length}
        />
      )}

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        {view === "dashboard" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
                <p className="text-sm text-gray-500 mt-0.5">Resumen general de cotizaciones SERVA</p>
              </div>
              <button
                onClick={() => setModalCreate(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-serva-green text-white rounded-lg text-sm font-semibold hover:bg-serva-green-dark transition-colors shadow-sm"
              >
                + Nueva cotización
              </button>
            </div>
            <DashboardView cotizaciones={cotizaciones} />
          </>
        )}

        {view === "kanban" && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pipeline de Cotizaciones</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Arrastra las tarjetas entre columnas para cambiar su estado
                </p>
              </div>
              {loading && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 size={13} className="animate-spin" />
                  Sincronizando…
                </div>
              )}
            </div>
            <KanbanBoard cotizaciones={filtered} onCardClick={handleCardClick} />
          </>
        )}

        {view === "tabla" && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Todas las Cotizaciones</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Vista de tabla con ordenamiento por columna
                </p>
              </div>
              {loading && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 size={13} className="animate-spin" />
                  Sincronizando…
                </div>
              )}
            </div>
            <TablaView cotizaciones={filtered} onRowClick={handleCardClick} />
          </>
        )}
      </main>

      {/* Modal: Crear cotización */}
      <Modal
        isOpen={modalCreate}
        onClose={() => setModalCreate(false)}
        title="Nueva Cotización"
        size="xl"
      >
        <CotizacionForm onClose={() => setModalCreate(false)} />
      </Modal>

      {/* Modal: Ver detalle */}
      <Modal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title="Detalle de Cotización"
        size="xl"
      >
        {selectedCard && (
          <CotizacionDetail
            cotizacion={selectedCard}
            onEdit={handleEdit}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </Modal>

      {/* Modal: Editar */}
      <Modal
        isOpen={!!editingCard}
        onClose={handleEditClose}
        title="Editar Cotización"
        size="xl"
      >
        {editingCard && (
          <CotizacionForm
            cotizacion={editingCard}
            onClose={handleEditClose}
          />
        )}
      </Modal>
    </div>
  );
}
