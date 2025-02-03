(function() {
  const GA_ID = document.currentScript.getAttribute('data-ga-id');
  const consent = document.currentScript.getAttribute('data-consent');

  window.dataLayer = window.dataLayer || [];

  window.gtag = window.gtag || function gtag() {
    dataLayer.push(arguments);
  };

  gtag('consent', 'default', {
    'analytics_storage': consent ? 'granted' : 'denied',
    'ad_storage': consent ? 'granted' : 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted',
  });

  gtag('js', new Date());
  gtag('config', GA_ID, {
    'anonymize_ip': !consent,
    'allow_google_signals': consent,
    'allow_ad_personalization_signals': consent,
    'restricted_data_processing': !consent,
  });
})();
