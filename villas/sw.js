// Trabajador de la app de PortalHoz (solo esta carpeta).
// Guarda la portada y los íconos para que, sin internet, la app abra y muestre «Sin conexión» en lugar del error del navegador.
// El portal en sí (Apps Script) nunca se guarda aquí: siempre se pide en vivo.
const VERSION = 'villas-3ba07bdc';
// Notificaciones push (Firebase Cloud Messaging): llegan solo con datos y este trabajador las muestra SIEMPRE,
// con la app abierta o cerrada (la librería de Firebase no las muestra si la app está a la vista).
// Al tocarla abre la app (o la trae al frente si ya está abierta).
self.addEventListener('push', e => {
  let j = {};
  try { j = e.data ? e.data.json() : {}; } catch (x) { j = {}; }
  const d = j.data || {}, n = j.notification || {};
  const titulo = d.titulo || n.title || 'Villas del Portal 3';
  e.waitUntil(self.registration.showNotification(titulo, {
    body: d.texto || n.body || '', icon: '../assets/portalhoz-icono-192.png', badge: '../assets/portalhoz-icono-192.png',
    tag: (d.tipo || 'aviso') + '-' + Date.now(), data: { enlace: d.enlace || '' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const app = new URL('./', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    const abierta = ws.find(w => w.url.indexOf(app) === 0);
    return abierta ? abierta.focus() : self.clients.openWindow(app);
  }));
});
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
