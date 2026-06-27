"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker once, on the client, after load. Kept tiny
 * and side-effect-only so it can sit in the root layout without affecting SSR.
 * Registration only runs in production builds to avoid interfering with the
 * dev/HMR server.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
