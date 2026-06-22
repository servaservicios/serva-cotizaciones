"use client";
import { LayoutDashboard, Kanban, Table2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  activeView: "dashboard" | "kanban" | "tabla";
  onViewChange: (v: "dashboard" | "kanban" | "tabla") => void;
}

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "kanban" as const, label: "Kanban", icon: Kanban },
  { id: "tabla" as const, label: "Tabla", icon: Table2 },
];

export default function Navbar({ activeView, onViewChange }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-serva-green shadow-md sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
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

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1 ml-4">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  activeView === id
                    ? "bg-white text-serva-green shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Mobile menu */}
          <button
            className="sm:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="sm:hidden bg-serva-green-dark border-t border-white/10 px-4 pb-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onViewChange(id); setMobileOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all mt-1",
                activeView === id
                  ? "bg-white text-serva-green"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
