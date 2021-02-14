//  For now, only a static cache is used.

//var static_cache = 'v' + Date.parse('Revision 2021-02-05T20:02:17+0100'.substring(9));
var static_cache = 'v' + 'TMP';

var selfidentity = 'SW 1';


// FIXME helper for testing purposes
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


self.addEventListener('install', async event => {
    console.debug('Installing service worker.');
    //await new Promise(resolve => setTimeout(resolve, 5000));

    //self.skipWaiting()
    //    .then(() => {
    //        console.debug('New service worker skipWaited.')
    //    });
    event.waitUntil(
        caches.open(static_cache).then(cache => cache.addAll([
            '/index.html',
            '/index.css',
            //'/index.js',
            '/appicon.png',
            '/favicon.ico',
            '/manifest.json',
            // FIXME Add fonts!!!!
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
    return;
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
                //console.log('Cache matched for', event.request.url);
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
                //console.log('Retrieving from network', event.request.url);
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

