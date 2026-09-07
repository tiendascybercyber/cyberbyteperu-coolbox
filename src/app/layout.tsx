import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyber Byte Perú | Tus trámites, sin vueltas",
  description: "Trámites digitales rápidos, seguros y acompañados en Perú.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE">
      <body>{children}</body>
    </html>
  );
}
