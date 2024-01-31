const GA_ID = document.currentScript.getAttribute("data-ga-id");

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', GA_ID);
