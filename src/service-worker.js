/* eslint-disable no-restricted-globals */

// Retirement ("kill switch") worker for the relaunch.
//
// The previous worker precached the whole app shell, so returning users
// could keep getting an old build. index.js now unregisters the worker on
// every load, but users still controlled by the old worker first run the
// old cached JS, which only checks for an updated /service-worker.js.
// This file is that update: it activates immediately, deletes the app's
// caches and unregisters itself, so the next load comes from the network.
// It intercepts nothing (no fetch handler).
//
// To bring offline caching back later, restore the previous Workbox
// version of this file from git history (before fix/launch-config) and
// switch index.js back to serviceWorkerRegistration.register().

// CRA's InjectManifest build step requires this reference to exist.
// eslint-disable-next-line no-unused-vars
const ignoredManifest = self.__WB_MANIFEST;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('workbox-') || key === 'images')
          .map((key) => caches.delete(key))
      );
      await self.registration.unregister();
    })()
  );
});
