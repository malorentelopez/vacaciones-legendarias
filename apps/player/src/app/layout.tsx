import type { Metadata, Viewport } from "next";
import { Bangers, Nunito } from "next/font/google";
import { Providers } from "@/components/providers";
import { PLAYER_THEME_COLOR } from "@/config/branding";
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
  applicationName: "Verano Legendario",
  appleWebApp: {
    capable: true,
    title: "Verano Legendario",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logo-favicon.png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: PLAYER_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${nunito.variable} ${bangers.variable} font-game min-h-screen min-h-[100dvh] pt-[env(safe-area-inset-top,0px)]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
