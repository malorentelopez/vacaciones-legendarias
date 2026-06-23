import type { Metadata } from "next";
import { Bangers, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-game",
});

const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Verano Legendario",
  description: "Tu aventura de verano — misiones, XP y recompensas en familia",
  icons: {
    icon: "/logo-favicon.png",
    apple: "/logo-favicon.png",
  },
  applicationName: "Verano Legendario",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${nunito.variable} ${bangers.variable} font-game min-h-screen`}>{children}</body>
    </html>
  );
}
