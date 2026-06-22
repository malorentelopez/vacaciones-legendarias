import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin — Verano Legendario",
  description: "Panel de administración familiar",
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
  applicationName: "Verano Legendario",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen`}>{children}</body>
    </html>
  );
}
