
'use strict';

const CACHE = 'sag-production-shell-2026-10-25-3';

const FILES = [
  './',
  './index.html',
  './config.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    for (const path of FILES) {
      const response = await fetch(
        new Request(path, { cache: 'reload' })
      );

      if (!response.ok) {
        throw new Error('Fichier inaccessible : ' + path);
      }

      if (response.redirected) {
        throw new Error('Redirection détectée : ' + path);
      }

      await cache.put(path, response);
    }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    for (const key of keys) {
      if (
        key.startsWith('sag-production-shell-') &&
        key !== CACHE
      ) {
        await caches.delete(key);
      }
    }

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);

  if (url.origin !== scope.origin) return;
  if (!url.pathname.startsWith(scope.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match('./index.html');

      if (cached) return cached;

      return fetch(request);
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);

    if (cached) return cached;

    return fetch(request);
  })());
});
