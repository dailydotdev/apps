const GA_ID = document.currentScript.getAttribute('data-ga-id');
const userId = document.currentScript.getAttribute('data-user-id');
const instanceId = document.currentScript.getAttribute('data-instance-id');

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', GA_ID, {
  'user_id': userId,
  'client_id': instanceId,
});
