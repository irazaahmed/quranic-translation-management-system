/*
 * Service worker for the Translation Management System PWA.
 *
 * Design goal: make the app installable & fast WITHOUT ever serving stale
 * data. This is a live management system, so freshness beats aggressive
 * caching. The rules below are deliberately conservative:
 *
 *   - Only same-origin GET requests are ever touched. Supabase (cross-origin),
 *     auth, and every POST/PUT pass straight through to the network.
 *   - /api/* is never cached.
 *   - Hashed, immutable static assets (/_next/static/, /icons/, fonts, images)
 *     are cache-first — they're safe because their URLs change on every build.
 *   - Page navigations are network-first: when online you always get fresh
 *     HTML; only when the network fails do we fall back to a cached copy, then
 *     to the offline page.
 *   - Old caches are cleared on activate, and the worker takes control fast.
 */

const VERSION = "tms-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|gif|webp|svg|ico)$/i.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave Supabase & co. alone
  if (url.pathname.startsWith("/api")) return; // never cache API/auth

  // Cache-first for hashed, immutable static assets.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // Network-first for page navigations — fresh when online, cached when not.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Everything else (RSC payloads, data fetches): straight to network, no cache.
});
