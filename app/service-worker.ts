/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

/// <reference path="node_modules/@types/workbox-sw/index.d.ts" />

importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js',
);

workbox.routing.setDefaultHandler(new workbox.strategies.NetworkFirst());

workbox.routing.registerRoute(
  '/',
  new workbox.strategies.StaleWhileRevalidate(),
);

workbox.routing.registerRoute(
  /\/_\//,
  new workbox.strategies.NetworkFirst({
    cacheName: 'feed-caches',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 10 * 60,
      }),
    ],
  }),
);

// Parcel hashed resources
workbox.routing.registerRoute(
  /\.[0-9a-f]{8}\./,
  new workbox.strategies.CacheFirst(),
);
