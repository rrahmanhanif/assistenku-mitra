const CACHE_NAME = 'mitra-proto-v1';
const APP_SHELL = [
  '/proto/index.html',
  '/proto/login.html',
  '/proto/register.html',
  '/proto/verify-email.html',
  '/proto/dashboard.html',
  '/proto/jobs.html',
  '/proto/job-detail.html',
  '/proto/chat.html',
  '/proto/payout.html',
  '/proto/profile.html',
  '/proto/settings.html',
  '/proto/assets/app.css',
  '/proto/assets/app.js',
  '/proto/assets/catalog.js',
  '/proto/assets/icon.svg',
  '/proto/manifest.webmanifest',
];

const OFFLINE_HTML = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Offline</title><style>body{font-family:Arial, sans-serif;display:grid;place-items:center;min-height:100vh;background:#f5f7fb;color:#111827;} .card{background:#fff;padding:20px;border:1px solid #e5e7eb;border-radius:12px;max-width:400px;text-align:center;}</style></head><body><div class="card"><h1>Offline</h1><p>Aplikasi tetap terbuka. Koneksi belum tersedia.</p></div></body></html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, code: 'NETWORK_ERROR', message: 'API belum siap' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function cachePage(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html' } });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(cachePage(request));
    return;
  }

  if (['style', 'script', 'image'].includes(request.destination)) {
    event.respondWith(cacheFirst(request));
  }
});
