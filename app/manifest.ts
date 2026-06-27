import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes the site installable as a PWA (home-screen icon,
 * standalone full-screen window). Served by Next at /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Translation Management System",
    short_name: "TMS",
    description:
      "Manage Quranic translation meetings and the English translation production pipeline in one place.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#10b981",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
