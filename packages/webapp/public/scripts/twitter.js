const TWITTER_PIXEL_ID = document.currentScript.getAttribute("data-twitter-id");

function initializeTwitterPixel(e,t,n,s,u,a) {
  e.twq ||
  (s = e.twq = function(){
    s.exe ? s.exe.apply(s,arguments) : s.queue.push(arguments);
  },
    s.version = '1.1',
    s.queue = [],
    u = t.createElement(n),
    u.async = !0,
    u.src = 'https://static.ads-twitter.com/uwt.js',
    a = t.getElementsByTagName(n)[0],
    a.parentNode.insertBefore(u,a))
}

initializeTwitterPixel(
  window,
  document,
  "script",
);

window.twq("config", TWITTER_PIXEL_ID);
