import type { MetadataRoute } from "next";
import { PLAYER_THEME_COLOR } from "@/config/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Verano Legendario",
    short_name: "Legendario",
    description: "Tu aventura de verano — misiones, XP y recompensas en familia",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    categories: ["games", "education", "kids"],
    lang: "es",
    background_color: PLAYER_THEME_COLOR,
    theme_color: PLAYER_THEME_COLOR,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
