//  For now, only a static cache is used.

//var static_cache = 'v' + Date.parse('Revision 2021-02-05T20:02:17+0100'.substring(9));
var static_cache = 'v' + 'TMP';

var selfidentity = 'SW 1';
const staticCacheVersion = 1;

const staticCachePrefix = `trujaman [${new URL(self.registration.scope).pathname}]`;
const staticCache = `${staticCachePrefix} v${staticCacheVersion}`;
static_cache = staticCache;

console.log(self);

console.log(self.registration.scope, new URL(self.registration.scope).pathname);


// FIXME helper for testing purposes
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


self.addEventListener('install', async event => {
    console.debug('Installing service worker for scope', self.registration.scope);
    //await new Promise(resolve => setTimeout(resolve, 5000));
    //let root = new URL(self.registration.scope).pathname;
    self.skipWaiting()
        .then(() => {
            console.debug('New service worker skipWaited.')
        });
    event.waitUntil(
        caches.open(static_cache).then(cache => cache.addAll([
            //new URL(self.registration.scope).pathname,
            '.',
            'index.css',
            'index.html',
            //'index.js',
            'appicon.png',
            'favicon.ico',
            'manifest.json',
        ]))
    );
});


// Clean old caches.
self.addEventListener('activate', event => {
    console.debug('New service worker activated!');
    // FIXME: use event.waitUntil()????
    // caches.keys().then(keys => Promise.all(keys.filter(key => key != static_cache).map(key => caches.delete(key))));
});


// Listen to messages from clients.
/* self.addEventListener('message', async event => {
    switch(event.data) {
        case 'skipWaiting':
            console.debug('skipWaiting requested.');
            await new Promise(resolve => setTimeout(resolve, 300));
            self.skipWaiting()
                .then(() => console.debug('I skipped waiting...'));
            break;
    }
}); */


// Fetch resources.
self.addEventListener('fetch', event => {
    console.log('Fetching', event.request.url, 'in', selfidentity);

    // if (event.request.url.includes('/version')) {
    //     event.respondWith(new Response(static_cache, {
    //         headers: {
    //             'content-type': 'text/plain'
    //         }
    //     }));
    // } else {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log('Cache matched for', event.request.url);
                //console.log('Revalidating from network', event.request.url);

                // FIXME: this won't work, because the service worker may be killed BEFORE the fetch is completed.
                // See:  https://serviceworke.rs/strategy-cache-update-and-refresh.html
                /* fetch(event.request).then(response => {
                    sleep(3).then(() => {
                        console.log('Revalidated from network', event.request.url);
                        caches.open(static_cache).then(cache => {
                            cache.put(event.request, response).then(() => {
                                console.log('Request stored in cache', event.request, response);
                            }).catch(err => {
                                console.log('Cache storage failed');
                            });
                        });
                    });
                }); */
                return response;
            } else {
                console.log('Retrieving from network', event.request.url);
                return fetch(event.request);
                /* return fetch(event.request).then(response => {
                    return sleep(3).then(() => {
                        console.log('Retrieved from network', event.request.url);
                        return response;
                    });
                }); */
            }
        })
    );

// }
});

