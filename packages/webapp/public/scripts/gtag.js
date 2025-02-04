(function() {
  const GA_ID = document.currentScript.getAttribute('data-ga-id');
  const consent = document.currentScript.getAttribute('data-consent');

  window.dataLayer = window.dataLayer || [];

  window.gtag = window.gtag || function gtag() {
    dataLayer.push(arguments);
  };

  gtag('consent', 'default', {
    'ad_storage': consent ? 'granted' : 'denied',
    'analytics_storage': consent ? 'granted' : 'denied',
    'functionality_storage': consent ? 'granted' : 'denied',
    'personalization_storage': consent ? 'granted' : 'denied',
    'ad_user_data': consent ? 'granted' : 'denied',
    'ad_personalization': consent ? 'granted' : 'denied',
  });

  gtag('js', new Date());
  gtag('config', GA_ID);
})();
