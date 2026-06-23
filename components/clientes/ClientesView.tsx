"use client";
import { useState, useEffect, useMemo } from "react";
import { Cliente } from "@/lib/types";
import { fetchClientes, createCliente, updateCliente, deleteCliente } from "@/lib/clientesService";
import { formatDate, cn } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2, X, AlertCircle, Clock, CheckCircle, ChevronUp, ChevronDown } from "lucide-react";
import Modal from "@/components/ui/Modal";

/* ── Helpers ─────────────────────────────────────────── */
function hoy(): string {
  return new Date().toISOString().split("T")[0];
}
function diasDiferencia(fecha: string): number {
  const hoyMs = new Date(hoy()).getTime();
  const fechaMs = new Date(fecha).getTime();
  return Math.round((fechaMs - hoyMs) / 86400000);
}
function estadoSeguimiento(fecha: string): "vencido" | "hoy" | "proximo" | "futuro" {
  if (!fecha) return "futuro";
  const diff = diasDiferencia(fecha);
  if (diff < 0) return "vencido";
  if (diff === 0) return "hoy";
  if (diff <= 7) return "proximo";
  return "futuro";
}

const estadoConfig = {
  vencido: { label: "Vencido",  dot: "bg-red-500",    badge: "bg-red-50 text-red-700 border-red-200" },
  hoy:     { label: "Hoy",      dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200" },
  proximo: { label: "Próximo",  dot: "bg-amber-300",  badge: "bg-amber-50 text-amber-600 border-amber-200" },
  futuro:  { label: "OK",       dot: "bg-serva-green", badge: "bg-serva-green-pale text-serva-green border-serva-green/20" },
};

/* ── Tipos locales ───────────────────────────────────── */
interface FormData { nombre: string; telefono: string; fechaSeguimiento: string; }
const emptyForm: FormData = { nombre: "", telefono: "", fechaSeguimiento: "" };

/* ── Componente principal ────────────────────────────── */
export default function ClientesView() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Cliente | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await fetchClientes();
    if (error) setError(error);
    else setClientes(data);
    setLoading(false);
  }

  function openCreate() {
    setEditando(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(c: Cliente) {
    setEditando(c);
    setForm({ nombre: c.nombre, telefono: c.telefono, fechaSeguimiento: c.fechaSeguimiento });
    setModalOpen(true);
  }
  function closeModal() { setModalOpen(false); setEditando(null); setForm(emptyForm); }

  async function handleSave() {
    if (!form.nombre.trim() || !form.fechaSeguimiento) return;
    setSaving(true);
    if (editando) {
      const { error } = await updateCliente(editando.id, {
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        fechaSeguimiento: form.fechaSeguimiento,
      });
      if (!error) {
        setClientes((prev) =>
          prev.map((c) =>
            c.id === editando.id
              ? { ...c, nombre: form.nombre.trim(), telefono: form.telefono.trim(), fechaSeguimiento: form.fechaSeguimiento }
              : c
          )
        );
      } else setError(error);
    } else {
      const { data, error } = await createCliente({
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        fechaSeguimiento: form.fechaSeguimiento,
      });
      if (data) setClientes((prev) => [...prev, data]);
      else if (error) setError(error);
    }
    setSaving(false);
    closeModal();
  }

  async function handleDelete(c: Cliente) {
    const { error } = await deleteCliente(c.id);
    if (!error) setClientes((prev) => prev.filter((x) => x.id !== c.id));
    else setError(error);
    setConfirmDelete(null);
  }

  /* ── Filtros y orden ─────────────────────────── */
  const pendientes = useMemo(() =>
    clientes.filter((c) => {
      const e = estadoSeguimiento(c.fechaSeguimiento);
      return e === "vencido" || e === "hoy" || e === "proximo";
    }).sort((a, b) => new Date(a.fechaSeguimiento).getTime() - new Date(b.fechaSeguimiento).getTime()),
  [clientes]);

  const filtrados = useMemo(() => {
    const q = search.toLowerCase();
    const lista = q
      ? clientes.filter((c) => c.nombre.toLowerCase().includes(q) || c.telefono.includes(q))
      : clientes;
    return [...lista].sort((a, b) => {
      const diff = new Date(a.fechaSeguimiento).getTime() - new Date(b.fechaSeguimiento).getTime();
      return sortAsc ? diff : -diff;
    });
  }, [clientes, search, sortAsc]);

  const vencidosCount = clientes.filter((c) => estadoSeguimiento(c.fechaSeguimiento) === "vencido").length;
  const hoyCount = clientes.filter((c) => estadoSeguimiento(c.fechaSeguimiento) === "hoy").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Cargando clientes…
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Error ─────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* ── Seguimientos pendientes ───────────────── */}
      {pendientes.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Seguimientos Pendientes</h3>
          <div className="space-y-2">
            {pendientes.map((c) => {
              const estado = estadoSeguimiento(c.fechaSeguimiento);
              const cfg = estadoConfig[estado];
              const diff = diasDiferencia(c.fechaSeguimiento);
              const diffLabel = diff < 0 ? `Hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? "s" : ""}` : diff === 0 ? "Hoy" : `En ${diff} día${diff !== 1 ? "s" : ""}`;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                  <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{c.nombre}</span>
                  {c.telefono && <span className="text-xs text-gray-400 hidden sm:block">{c.telefono}</span>}
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0", cfg.badge)}>
                    {diffLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Barra superior ───────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-serva-green bg-white"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-serva-green text-white rounded-xl text-sm font-bold hover:bg-serva-green-dark transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nuevo cliente</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* ── Tabla ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {search ? "Sin resultados para la búsqueda." : "Sin clientes registrados. Agrega el primero."}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-serva-green select-none whitespace-nowrap"
                      onClick={() => setSortAsc((v) => !v)}
                    >
                      <span className="flex items-center gap-1">
                        Próximo seguimiento
                        {sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Creado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtrados.map((c) => {
                    const estado = estadoSeguimiento(c.fechaSeguimiento);
                    const cfg = estadoConfig[estado];
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{c.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{c.telefono || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(c.fechaSeguimiento)}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", cfg.badge)}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(c.creadoEn)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => openEdit(c)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(c)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-50">
              {filtrados.map((c) => {
                const estado = estadoSeguimiento(c.fechaSeguimiento);
                const cfg = estadoConfig[estado];
                return (
                  <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{c.nombre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c.telefono || "Sin teléfono"} · {formatDate(c.fechaSeguimiento)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 tap-target">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setConfirmDelete(c)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 tap-target">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer count */}
        {filtrados.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-50 text-xs text-gray-400">
            {filtrados.length} cliente{filtrados.length !== 1 ? "s" : ""}
            {vencidosCount > 0 && <span className="ml-2 text-red-500 font-semibold">· {vencidosCount} vencido{vencidosCount !== 1 ? "s" : ""}</span>}
            {hoyCount > 0 && <span className="ml-2 text-amber-500 font-semibold">· {hoyCount} para hoy</span>}
          </div>
        )}
      </div>

      {/* ── Modal crear/editar ────────────────────── */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editando ? "Editar cliente" : "Nuevo cliente"} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Nombre del cliente o prospecto"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-serva-green"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teléfono</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              placeholder="10 dígitos"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-serva-green"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha de próximo seguimiento *</label>
            <input
              type="date"
              value={form.fechaSeguimiento}
              onChange={(e) => setForm((f) => ({ ...f, fechaSeguimiento: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-serva-green"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={closeModal}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.nombre.trim() || !form.fechaSeguimiento || saving}
              className="flex-1 py-2.5 rounded-xl bg-serva-green text-white text-sm font-bold hover:bg-serva-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando…" : editando ? "Guardar cambios" : "Crear cliente"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal confirmar eliminación ───────────── */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar cliente" size="sm">
        {confirmDelete && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Eliminar a <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Badge exportable para el Navbar ─────────────────── */
export function clientesBadgeCount(clientes: Cliente[]): number {
  return clientes.filter((c) => {
    const e = estadoSeguimiento(c.fechaSeguimiento);
    return e === "vencido" || e === "hoy";
  }).length;
}
