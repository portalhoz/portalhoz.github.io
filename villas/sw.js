// Trabajador de la app de PortalHoz (solo esta carpeta).
// Guarda la portada y los íconos para que, sin internet, la app abra y muestre «Sin conexión» en lugar del error del navegador.
// El portal en sí (Apps Script) nunca se guarda aquí: siempre se pide en vivo.
const VERSION = 'villas-v3';
const BASICOS = ['./', './index.html', './manifest.webmanifest', '../assets/portalhoz-icono-192.png', '../assets/portalhoz-icono-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Solo lo de este sitio: primero la red (para tener siempre lo último) y, si no hay, lo guardado
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(VERSION).then(c => c.put(e.request, copia));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
