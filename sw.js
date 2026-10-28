// Garde le cahier dans l'iPad pour qu'il s'ouvre sans Internet.
// Change CACHE quand tu mets une nouvelle version en ligne.
const CACHE = "cahier-sn2-v5";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Ouvre tout de suite la copie gardée, puis la met à jour en arrière-plan si Internet est là
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // l'IA Gemini passe directement
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request, { ignoreSearch: true }) ||
        (e.request.mode === "navigate" ? await cache.match("./index.html") : undefined);
      const network = fetch(e.request).then(resp => {
        if (resp && resp.ok) cache.put(e.request, resp.clone());
        return resp;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
