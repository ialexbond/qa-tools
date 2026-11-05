// Offline copy of the hosted page (GitHub Pages). index.html registers this file only over https;
// the double-clicked file never uses it.
// Network first: an open with a connection always gets the newest page and refreshes the copy;
// without a connection the last copy opens instead.
const CACHE = 'qa-tools-offline';

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE).then(cache => cache.add('./')));
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;   // fonts stay with the browser
    event.respondWith(
        // no-cache: GitHub Pages lets browsers keep a page for 10 minutes; the copy here is checked every time instead.
        fetch(request.url, { cache: 'no-cache' }).then(response => {
            if (response.ok) {
                const copy = response.clone();
                event.waitUntil(caches.open(CACHE).then(cache => cache.put(request.url, copy)));
            }
            return response;
        }).catch(() => caches.match(request.url, { ignoreSearch: true })
            .then(hit => hit || (request.mode === 'navigate' ? caches.match('./') : Response.error())))
    );
});
