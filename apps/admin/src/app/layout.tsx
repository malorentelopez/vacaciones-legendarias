import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { APP_THEME_COLOR } from "@repo/ui";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin — Verano Legendario",
  description: "Panel de administración familiar",
  icons: {
    icon: "/logo-favicon.png",
    apple: "/logo-favicon.png",
  },
  applicationName: "Verano Legendario",
  appleWebApp: {
    capable: true,
    title: "Admin Legendario",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: APP_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.className} min-h-screen min-h-[100dvh] pt-[env(safe-area-inset-top,0px)]`}
      >
        {children}
      </body>
    </html>
  );
}
