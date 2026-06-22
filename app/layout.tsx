import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SERVA | Control de Cotizaciones",
  description: "Plataforma de gestión de cotizaciones para SERVA Servicios",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
