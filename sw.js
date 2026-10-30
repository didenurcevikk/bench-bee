/* Bench Bee service worker: makes the app work offline.
   When you change any file, bump VERSION so phones pick up the new version. */
const VERSION = "bench-bee-v19";
const APP_FILES = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "photo.js",
  "data/western-blot.js",
  "manifest.webmanifest",
  "icons/favicon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts: use the saved copy if we have one, refresh it in the background.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.open(VERSION + "-fonts").then(async cache => {
        const saved = await cache.match(req);
        const fresh = fetch(req).then(res => { cache.put(req, res.clone()); return res; }).catch(() => saved);
        return saved || fresh;
      })
    );
    return;
  }

  // App files: try the network first so updates show up, fall back to the saved copy offline.
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
    );
  }
});
