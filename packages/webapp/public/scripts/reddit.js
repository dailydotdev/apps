(function() {
  const REDDIT_PIXEL_ID = document.currentScript.getAttribute('data-reddit-id');

  function initializeRedditPixel(w, d) {
    if (!w.rdt) {
      var p = w.rdt = function() {
        p.sendEvent ? p.sendEvent.apply(p, arguments) : p.callQueue.push(arguments);
      };

      p.callQueue = [];
      var t = d.createElement('script');
      t.src = 'https://www.redditstatic.com/ads/pixel.js',
        t.async = !0;
      var s = d.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(t, s);
    }
  }

  initializeRedditPixel(
    window,
    document,
  );

  window.rdt('init', REDDIT_PIXEL_ID);

  window.rdt('track', 'PageVisit');
})();
