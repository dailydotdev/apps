import React, { ReactElement } from 'react';
import Script from 'next/script';
import { isProduction } from '../../lib/constants';

export const FB_PIXEL_ID = '519268979315924';
export const GA_TRACKING_ID = 'AW-619408403';
export const TWITTER_TRACKING_ID = 'o6izs';
export const REDDIT_TRACKING_ID = 't2_j1li1n7e';
export const TIKTOK_TRACKING_ID = 'CO2RCPBC77U37LT1TAIG';

export const PixelTracking = (): ReactElement => {
  if (!isProduction) {
    return null;
  }

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
  if (!isProduction) {
    return null;
  }

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

export const HotJarTracking = (): ReactElement => {
  if (!isProduction) {
    return null;
  }

  return (
    <Script strategy="afterInteractive" id="load-hotjar">
      {`
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:3871311,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  );
};

export const TwitterTracking = (): ReactElement => {
  if (!isProduction) {
    return null;
  }

  return (
    <Script
      id="twitter-pixel"
      src="/scripts/twitter.js"
      strategy="afterInteractive"
      data-twitter-id={TWITTER_TRACKING_ID}
    />
  );
};

export const RedditTracking = (): ReactElement => {
  if (!isProduction) {
    return null;
  }

  return (
    <Script
      id="reddit-pixel"
      src="/scripts/reddit.js"
      strategy="afterInteractive"
      data-reddit-id={REDDIT_TRACKING_ID}
    />
  );
};

export const TiktokTracking = (): ReactElement => {
  if (!isProduction) {
    return null;
  }

  return (
    <Script
      id="tiktok-pixel"
      src="/scripts/tiktok.js"
      strategy="afterInteractive"
      data-tiktok-id={TIKTOK_TRACKING_ID}
    />
  );
};

export const trackAnalyticsSignUp = ({ experienceLevel }): void => {
  if (typeof globalThis.gtag === 'function') {
    globalThis.gtag('event', 'signup');
  }

  if (typeof globalThis.fbq === 'function') {
    globalThis.fbq('track', 'signup');
    globalThis.fbq('track', 'signup_experience_level', experienceLevel);
  }

  if (typeof globalThis.twq === 'function') {
    globalThis.twq('event', 'tw-o6izs-okoq6', {});
  }

  if (typeof globalThis.rdt === 'function') {
    globalThis.rdt('track', 'SignUp');
  }

  if (typeof globalThis.ttq?.track === 'function') {
    globalThis.ttq.track('signup');
  }
};
