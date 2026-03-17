const CACHE_NAME = 'ecokids-v2';
const OFFLINE_URL = '/offline.html';

// Assets to precache on install
const PRECACHE_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/submit-activity',
    '/student-dashboard',
    '/environmental-impact'
];

// Install: precache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Precaching core assets');
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch: Network-first for API, Cache-first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip Chrome extensions and non-http
    if (!url.protocol.startsWith('http')) return;

    // API requests: network-first with timeout
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful GET API responses for offline
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Try cache for offline API access
                    return caches.match(request).then((cached) => {
                        if (cached) return cached;
                        return new Response(
                            JSON.stringify({ success: false, message: 'You are offline', offline: true }),
                            { headers: { 'Content-Type': 'application/json' }, status: 503 }
                        );
                    });
                })
        );
        return;
    }

    // Static assets: stale-while-revalidate
    event.respondWith(
        caches.match(request).then((cached) => {
            const fetchPromise = fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to offline page for navigation requests
                    if (request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                    return cached;
                });

            return cached || fetchPromise;
        })
    );
});

// Background sync for offline activity submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-submissions') {
        event.waitUntil(syncOfflineSubmissions());
    }
});

async function syncOfflineSubmissions() {
    try {
        const db = await openDB();
        const tx = db.transaction('pending-submissions', 'readonly');
        const store = tx.objectStore('pending-submissions');
        const submissions = await getAllFromStore(store);

        for (const submission of submissions) {
            try {
                const response = await fetch('/api/v1/activity/submit', {
                    method: 'POST',
                    body: submission.formData,
                    headers: { 'Authorization': `Bearer ${submission.token}` }
                });

                if (response.ok) {
                    // Remove from offline queue
                    const deleteTx = db.transaction('pending-submissions', 'readwrite');
                    deleteTx.objectStore('pending-submissions').delete(submission.id);
                    console.log('[SW] Synced offline submission:', submission.id);
                } else {
                    console.error('[SW] Sync rejected by server for submission:', submission.id, 'status:', response.status);
                }
            } catch (err) {
                console.error('[SW] Sync failed for submission:', submission.id, err);
            }
        }
    } catch (err) {
        console.error('[SW] Background sync error:', err);
    }
}

// Simple IndexedDB helpers
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ecokids-offline', 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore('pending-submissions', { keyPath: 'id' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAllFromStore(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
