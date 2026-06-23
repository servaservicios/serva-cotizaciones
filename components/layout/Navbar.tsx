"use client";
import { LayoutDashboard, Kanban, Table2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  activeView: "dashboard" | "kanban" | "tabla" | "clientes";
  onViewChange: (v: "dashboard" | "kanban" | "tabla" | "clientes") => void;
  clientesBadge?: number;
}

export default function Navbar({ activeView, onViewChange, clientesBadge = 0 }: Props) {
  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard, badge: 0 },
    { id: "kanban" as const, label: "Kanban", icon: Kanban, badge: 0 },
    { id: "tabla" as const, label: "Tabla", icon: Table2, badge: 0 },
    { id: "clientes" as const, label: "Clientes", icon: Users, badge: clientesBadge },
  ];

  return (
    <>
      {/* ── Desktop / Tablet top bar ───────────────────────────── */}
      <nav className="hidden sm:block bg-serva-green shadow-md sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex items-center h-16 gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-serva-green font-black text-lg tracking-tight">S</span>
              </div>
              <div>
                <p className="text-white font-bold text-base tracking-wide leading-none">SERVA</p>
                <p className="text-white/60 text-xs font-medium leading-none mt-0.5">Cotizaciones</p>
              </div>
            </div>

            <div className="flex items-center gap-1 ml-4">
              {navItems.map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative",
                    activeView === id
                      ? "bg-white text-serva-green shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon size={16} />
                  {label}
                  {badge > 0 && (
                    <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center leading-none">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile top header (logo only) ─────────────────────── */}
      <header className="sm:hidden bg-serva-green shadow-md sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-serva-green font-black text-base tracking-tight">S</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide leading-none">SERVA</p>
              <p className="text-white/60 text-[10px] font-medium leading-none mt-0.5">Cotizaciones</p>
            </div>
          </div>
          <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
            {navItems.find((n) => n.id === activeView)?.label}
          </span>
        </div>
      </header>

      {/* ── Mobile bottom navigation ───────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav bg-white/95 border-t border-gray-200 safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full tap-target transition-all relative",
                activeView === id ? "text-serva-green" : "text-gray-400"
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={activeView === id ? 2.5 : 1.8} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                    {badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-semibold",
                activeView === id ? "text-serva-green" : "text-gray-400"
              )}>
                {label}
              </span>
              {activeView === id && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-serva-green" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
