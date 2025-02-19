(function() {
  const PIXEL_ID = document.currentScript.getAttribute('data-pixel-id');
  const userId = document.currentScript.getAttribute('data-user-id');
  const email = document.currentScript.getAttribute('data-email');
  const consent = document.currentScript.getAttribute('data-consent');

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const anonId = urlParams.get('fb_anon_id');

  function initializeFacebookPixel(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }

  initializeFacebookPixel(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js',
  );

  window.updateFbUserData = (userId, email) => {
    window.fbq.instance.pixelsByID[PIXEL_ID].userData.external_id = userId;
    window.fbq.instance.pixelsByID[PIXEL_ID].userData.email = email;
  };

  window.fbq('consent', consent ? 'grant' : 'revoke');

  const args = userId ? { external_id: userId } : {};
  if (anonId) {
    args.anon_id = anonId;
  }
  if (email) {
    args.em = email;
  }
  window.fbq('init', PIXEL_ID, args);
})();
