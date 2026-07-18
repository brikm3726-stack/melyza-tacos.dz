/* =========================================================
   Service Worker — Melyza Tacos (PWA)
   Rend l'application rapide et disponible hors connexion.
   ========================================================= */

const CACHE = 'melyza-tacos-v1';

// Fichiers mis en cache dès l'installation (le "cœur" de l'app)
const A_METTRE_EN_CACHE = [
  './',
  './index.html',
  './menu.html',
  './css/style.css',
  './js/main.js',
  './manifest.webmanifest',
  './images/logo.png',
  './images/restaurant.jpg',
  './images/burger.jpg',
  './images/burger-cutout.png',
  './images/tacos.jpg',
  './images/sandwich-avocat.jpg',
  './images/menu-tacos.jpg',
  './images/menu-burgers.jpg',
  './images/menu-desserts.jpg',
  './images/galerie-1.jpg',
  './images/galerie-2.jpg',
  './images/galerie-3.jpg',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png'
];

// Installation : on remplit le cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(A_METTRE_EN_CACHE)).then(() => self.skipWaiting())
  );
});

// Activation : on supprime les anciens caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Requêtes : on répond depuis le cache, sinon depuis le réseau
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // On ne touche pas aux requêtes externes (Google Maps, WhatsApp, polices...)
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  e.respondWith(
    caches.match(req).then((cache) => {
      if (cache) return cache;

      return fetch(req).then((rep) => {
        // On met en cache au passage les nouvelles ressources internes
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(req, copie)).catch(() => {});
        return rep;
      }).catch(() => {
        // Hors ligne : pour une page, on renvoie l'accueil
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
