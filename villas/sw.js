// Trabajador de la app de PortalHoz (solo esta carpeta).
// Guarda la portada y los íconos para que, sin internet, la app abra y muestre «Sin conexión» en lugar del error del navegador.
// El portal en sí (Apps Script) nunca se guarda aquí: siempre se pide en vivo.
const VERSION = 'villas-3ea028ad';
// Notificaciones push (Firebase): con la app cerrada las muestra y, al tocarlas, abre la app
const FIREBASE = {"apiKey":"AIzaSyATzX3vYeqccR35srcw2-4wlRG8nMTBMfs","authDomain":"portalhoz.firebaseapp.com","projectId":"portalhoz","messagingSenderId":"272717077640","appId":"1:272717077640:web:95bdcd0692437a4065d33d","vapidKey":"BBG9WAgRLivz_EfX7hAhuFZQFHNjWQvGSLBkowCD8jbTgDoqpE8BjG6Wx599qjg8-Oeme-9AgbRXpaXfVkd7OF0"};
if (FIREBASE && FIREBASE.apiKey) {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp(FIREBASE);
  firebase.messaging();
}
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
