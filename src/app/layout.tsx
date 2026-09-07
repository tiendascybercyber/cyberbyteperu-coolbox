import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyber Byte Perú | Tienda tech y trámites en Huancayo",
  description: "Tienda de tecnología, accesorios, servicio técnico y trámites digitales en Huancayo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-PE"><body>{children}</body></html>;
}
