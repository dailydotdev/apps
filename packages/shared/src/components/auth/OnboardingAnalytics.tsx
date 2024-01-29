import React, { ReactElement } from 'react';
import Script from 'next/script';

export const FB_PIXEL_ID = '519268979315924';
export const GA_TRACKING_ID = 'G-88PBR8PHX0';

export const PixelTracking = (): ReactElement => {
  return (
    <>
      <Script
        id="fb-pixel"
        src="/scripts/pixel.js"
        strategy="afterInteractive"
        data-pixel-id={FB_PIXEL_ID}
      />
      <noscript>
        <img
          alt="Facebook Pixel"
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=519268979315924&ev=PageView&noscript=1"
        />
      </noscript>
    </>
  );
};

export const GtagTracking = (): ReactElement => {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="ga-script"
        src="/scripts/gtag.js"
        strategy="afterInteractive"
        data-ga-id={GA_TRACKING_ID}
      />
    </>
  );
};

export const trackAnalyticsSignUp = (): void => {
  if (typeof globalThis.gtag === 'function') {
    globalThis.gtag('event', 'signup', {
      send_to: 'AW-619408403/8JaXCNWU7voBEJPYracC',
    });
  }

  if (typeof globalThis.fbq === 'function') {
    globalThis.fbq('track', 'signup');
  }
};
