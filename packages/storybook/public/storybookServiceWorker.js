/* eslint-disable */
// MSW's worker hands every request to the page and waits for its answer,
// even the dev server's modules, which no handler mocks. A page loads
// thousands of them, so they go straight to the network here; this listener
// runs first and keeps MSW's from seeing them.
const passThrough = ['script', 'style', 'font', 'image'];

self.addEventListener('fetch', (event) => {
  if (passThrough.includes(event.request.destination)) {
    event.stopImmediatePropagation();
  }
});

importScripts('./mockServiceWorker.js');
