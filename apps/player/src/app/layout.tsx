import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-game",
});

export const metadata: Metadata = {
  title: "Verano Legendario",
  description: "Tu aventura de verano",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${nunito.variable} font-game min-h-screen`}>{children}</body>
    </html>
  );
}
