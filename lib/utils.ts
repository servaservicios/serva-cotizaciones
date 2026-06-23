import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "—";
  // Avoid appending T00:00:00 to strings that already have a time component
  const normalized = dateString.includes("T") ? dateString : dateString + "T00:00:00";
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function generateNumeroCotizacion(total: number): string {
  const year = new Date().getFullYear();
  const num = String(total + 1).padStart(3, "0");
  return `COT-${year}-${num}`;
}
