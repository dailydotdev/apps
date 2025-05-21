import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { isProduction } from '@dailydotdev/shared/src/lib/constants';
import type { UserExperienceLevel } from '@dailydotdev/shared/src/lib/user';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { GdprConsentKey } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { useConsentCookie } from '@dailydotdev/shared/src/hooks/useCookieConsent';

const FB_PIXEL_ID = '519268979315924';
const GA_TRACKING_ID = 'G-VTGLXD7QSN';
const TWITTER_TRACKING_ID = 'o6izs';
const REDDIT_TRACKING_ID = 't2_j1li1n7e';
const TIKTOK_TRACKING_ID = 'CO2RCPBC77U37LT1TAIG';

export type PixelProps = {
  instanceId?: string;
  userId?: string;
  consent?: boolean;
  email?: string;
};

export type HotjarProps = {
  hotjarId: string;
};

const FbTracking = ({ userId, consent, email }: PixelProps): ReactElement => {
  useEffect(() => {
    if (typeof globalThis.fbq === 'function') {
      globalThis.fbq('consent', consent ? 'grant' : 'revoke');
    }
  }, [consent]);

  useEffect(() => {
    if (typeof globalThis.updateFbUserData === 'function') {
      globalThis.updateFbUserData(userId, email);
    }
  }, [email, userId]);

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        data-pixel-id={FB_PIXEL_ID}
        data-user-id={userId}
        data-email={email}
        data-consent={consent}
      >
        {`
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
    if (window.fbq?.instance?.pixelsByID?.[PIXEL_ID]?.userData) {
      window.fbq.instance.pixelsByID[PIXEL_ID].userData.external_id = userId;
      window.fbq.instance.pixelsByID[PIXEL_ID].userData.email = email;
    }
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
      `}
      </Script>
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

const GtagTracking = ({
  userId,
  instanceId,
  consent,
}: PixelProps): ReactElement => {
  useEffect(() => {
    if (typeof globalThis.gtag === 'function') {
      globalThis.gtag('consent', 'update', {
        ad_storage: consent ? 'granted' : 'denied',
        analytics_storage: consent ? 'granted' : 'denied',
        functionality_storage: consent ? 'granted' : 'denied',
        personalization_storage: consent ? 'granted' : 'denied',
        ad_user_data: consent ? 'granted' : 'denied',
        ad_personalization: consent ? 'granted' : 'denied',
      });
    }
  }, [consent]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="ga-script"
        strategy="afterInteractive"
        data-ga-id={GA_TRACKING_ID}
        data-user-id={userId}
        data-instance-id={instanceId}
        data-consent={consent}
      >
        {`
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
      `}
      </Script>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const HotJarTracking = ({ hotjarId }: HotjarProps): ReactElement => {
  const { cookieExists: acceptedMarketing } = useConsentCookie(
    GdprConsentKey.Marketing,
  );
  const { isGdprCovered } = useAuthContext();
  const consent = !isGdprCovered || acceptedMarketing;
  if (!consent) {
    return null;
  }
  return (
    <Script strategy="afterInteractive" id="load-hotjar">
      {`
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${hotjarId},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  );
};

const TwitterTracking = (): ReactElement => {
  return (
    <Script
      id="twitter-pixel"
      strategy="afterInteractive"
      data-twitter-id={TWITTER_TRACKING_ID}
    >
      {`
      (function() {
  const TWITTER_PIXEL_ID = document.currentScript.getAttribute('data-twitter-id');

  function initializeTwitterPixel(e, t, n, s, u, a) {
    e.twq ||
    (s = e.twq = function() {
      s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
    },
      s.version = '1.1',
      s.queue = [],
      u = t.createElement(n),
      u.async = !0,
      u.src = 'https://static.ads-twitter.com/uwt.js',
      a = t.getElementsByTagName(n)[0],
      a.parentNode.insertBefore(u, a));
  }

  initializeTwitterPixel(
    window,
    document,
    'script',
  );

  window.twq('config', TWITTER_PIXEL_ID);
})();
      `}
    </Script>
  );
};

const RedditTracking = (): ReactElement => {
  return (
    <Script
      id="reddit-pixel"
      strategy="afterInteractive"
      data-reddit-id={REDDIT_TRACKING_ID}
    >
      {`(function() {
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
      `}
    </Script>
  );
};

const TiktokTracking = (): ReactElement => {
  return (
    <Script
      id="tiktok-pixel"
      strategy="afterInteractive"
      data-tiktok-id={TIKTOK_TRACKING_ID}
    >
      {`(function() {
  const TIKTOK_PIXEL_ID = document.currentScript.getAttribute('data-tiktok-id');

  function initializeTiktokPixel(w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = w[t] = w[t] || [];
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'], ttq.setAndDefer = function(t, e) {
      t[e] = function() {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function(t) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    }, ttq.load = function(e, n) {
      var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = i, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {};
      var o = document.createElement('script');
      o.type = 'text/javascript', o.async = !0, o.src = i + '?sdkid=' + e + '&lib=' + t;
      var a = document.getElementsByTagName('script')[0];
      a.parentNode.insertBefore(o, a);
    };

    ttq.load(TIKTOK_PIXEL_ID);
    ttq.page();
  }

  initializeTiktokPixel(
    window,
    document,
    'ttq',
  );
})();
`}
    </Script>
  );
};

export const EXPERIENCE_TO_SENIORITY: Record<
  keyof typeof UserExperienceLevel,
  string
> = {
  LESS_THAN_1_YEAR: 'junior',
  MORE_THAN_1_YEAR: 'junior',
  MORE_THAN_2_YEARS: 'mid',
  MORE_THAN_4_YEARS: 'mid',
  MORE_THAN_6_YEARS: 'senior',
  MORE_THAN_10_YEARS: 'senior',
  NOT_ENGINEER: 'not_engineer',
};

export const Pixels = (): ReactElement => {
  const { cookieExists: acceptedMarketing } = useConsentCookie(
    GdprConsentKey.Marketing,
  );
  const { user, anonymous, isAuthReady, isGdprCovered } = useAuthContext();
  const userId = user?.id || anonymous?.id;

  const { query } = useRouter();
  const instanceId = query?.aiid?.toString();

  const consent = !isGdprCovered || acceptedMarketing;
  const props: PixelProps = { userId, instanceId, consent, email: user?.email };

  if (!isProduction || !userId || !isAuthReady) {
    return null;
  }

  return (
    <>
      <FbTracking {...props} />
      <GtagTracking {...props} />
      {consent && (
        <>
          <TiktokTracking />
          <TwitterTracking />
          <RedditTracking />
        </>
      )}
    </>
  );
};
