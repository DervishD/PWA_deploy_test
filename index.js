"use strict";

let trujaman_version = '0.0.11-alpha';

// Some initialization for the DOM.
document.addEventListener('DOMContentLoaded', () => {
    // Show current version on page.
    document.getElementById('version').textContent = trujaman_version;
    // document.title += ' ' + trujaman_version;
});


// FIXME helper for testing purposes
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Register service worker.
if ('serviceWorker' in navigator) {
    // Helpers to show and hide the update toast.
    // let hideUpdateToast = () => {
    //     document.getElementById('update_available').style.visibility = 'hidden';
    // };

    // let showUpdateToast = (serviceworker) => {
    //     document.getElementById('update_available').style.visibility = 'visible';
    //     document.getElementById('force_install').onclick = () => {
    //         console.log('Sending skipWaiting message to ', serviceworker);
    //         serviceworker.postMessage('skipWaiting');
    //         hideUpdateToast();
    //     };
    //     document.getElementById('close').onclick = () => hideUpdateToast();
    // };

    // Helper to show status on the page.
    let setStatus = status => {
        if (!status) return;
        document.getElementById('status').textContent.replace = status;
    };

    window.addEventListener('load', () => {

        console.log('Window loaded.');

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.debug('This page has a new controller!');
            if (refreshing) return;
            refreshing = true;
            console.debug('Reloading window.');
            window.location.reload();
        });

        navigator.serviceWorker.register('sw.js').then(registration => {
            
            console.log('Service worker registered for scope', registration.scope);
            // No controller for this page, nothing to do for now. FIXME
            if (!navigator.serviceWorker.controller) {
                document.getElementById('debug').textContent = '(welcome)';
            }

            /* // FIXME
            window.addEventListener('beforeinstallprompt', event => {
                // Prevent the mini-infobar from appearing on mobile
                // event.preventDefault();
                document.getElementById('installmarker').textContent = '⊕';
            }); */

            // A new service worker has been fetched, watch for state changes.
            //
            // This event is fired EVERY TIME a service worker is fetched and
            // succesfully parsed and goes into 'installing' state. This
            // happens, too, the very first time the page is visited, the very
            // first time a service worker is fetched for this page, when the
            // page doesn't have a controller, but in that case there's no new
            // version available and the notification must not appear.
            //
            // So, if the page doesn't have a controller, no notification shown.
            //
            // FIXME: of course, we can return much before if there's no controller for the page.
            // FIXME: we don't need all this code if we are going to forcefully install the service worker on refresh, without user interaction.
            /* registration.addEventListener('updatefound', () => {
                console.log('Update found of service worker.');
                registration.installing.onstatechange = function () {  // No arrow function because 'this' is needed.
                    if (this.state == 'installed') {
                        if (!navigator.serviceWorker.controller) {
                            console.log('First install for this service worker.');
                        } else {
                            console.log('New service worker is ready to activate.');
                            // showUpdateToast(this);
                        }
                    }
                };
            }); */

            // If a service worker is in 'waiting' state, then maybe the user
            // dismissed the notification when the service worker was in the
            // 'installing' state or maybe the 'updatefound' event was fired
            // before it could be listened, or something like that. Anyway, in
            // that case the notification has to be shown again.
            //
            if (registration.waiting) {
                console.debug('New service worker is skipWaiting');
                // setTimeout(() => registration.waiting.postMessage('skipWaiting'), 1000);
                // registration.waiting.postMessage('skipWaiting');
                // showUpdateToast(registration.waiting);
            }

            // Check for service worker updates every 6 hours.
            // The weird way of specifying the function to be executed is
            // because 'registration.update()' expects 'registration' as
            // 'this', but when using 'setInterval()' the called funcion is
            // unbound. Using an anonymous function creates a closure and
            // proper binding.
            //
            // FIXME: is this needed, really????
            //
            // setInterval(() => {
            //     console.log('Checking for service worker updates.');
            //     registration.update().catch(error => console.log('Error updating service worker:', error));
            // }, 60 * 60 * 1000);
        }).catch(error => {
            console.error('Service worker registration failed!');
            console.error(error);
        });
    });
} else {
    console.warn('Browser is not compatible with PWA.');
}
