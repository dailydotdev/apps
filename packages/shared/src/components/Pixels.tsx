import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { isProduction } from '../lib/constants';
import type { UserExperienceLevel } from '../lib/user';
import { useAuthContext } from '../contexts/AuthContext';
import { fromCDN } from '../lib';
import { GdprConsentKey } from '../hooks/useCookieBanner';
import { useConsentCookie } from '../hooks/useCookieConsent';

const FB_PIXEL_ID = '519268979315924';
const GA_TRACKING_ID = 'G-VTGLXD7QSN';
const TWITTER_TRACKING_ID = 'o6izs';
const REDDIT_TRACKING_ID = 't2_j1li1n7e';
const TIKTOK_TRACKING_ID = 'CO2RCPBC77U37LT1TAIG';

export type PixelProps = {
  instanceId?: string;
  userId?: string;
  consent?: boolean;
};

export type HotjarProps = {
  hotjarId: string;
};

const FbTracking = ({ userId, consent }: PixelProps): ReactElement => {
  useEffect(() => {
    if (typeof globalThis.fbq === 'function') {
      globalThis.fbq('consent', consent ? 'grant' : 'revoke');
    }
  }, [consent]);

  return (
    <>
      <Script
        id="fb-pixel"
        src={fromCDN('/scripts/fb.js')}
        strategy="afterInteractive"
        data-pixel-id={FB_PIXEL_ID}
        data-user-id={userId}
        data-consent={consent}
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
        src={fromCDN('/scripts/gtag.js')}
        strategy="afterInteractive"
        data-ga-id={GA_TRACKING_ID}
        data-user-id={userId}
        data-instance-id={instanceId}
        data-consent={consent}
      />
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HotJarTracking = ({ hotjarId }: HotjarProps): ReactElement => {
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
      src={fromCDN('/scripts/twitter.js')}
      strategy="afterInteractive"
      data-twitter-id={TWITTER_TRACKING_ID}
    />
  );
};

const RedditTracking = (): ReactElement => {
  return (
    <Script
      id="reddit-pixel"
      src={fromCDN('/scripts/reddit.js')}
      strategy="afterInteractive"
      data-reddit-id={REDDIT_TRACKING_ID}
    />
  );
};

const TiktokTracking = (): ReactElement => {
  return (
    <Script
      id="tiktok-pixel"
      src={fromCDN('/scripts/tiktok.js')}
      strategy="afterInteractive"
      data-tiktok-id={TIKTOK_TRACKING_ID}
    />
  );
};

interface LogSignUpProps {
  experienceLevel: keyof typeof UserExperienceLevel;
}

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

export const logPixelSignUp = ({ experienceLevel }: LogSignUpProps): void => {
  const urlParams = new URLSearchParams(window.location.search);
  const isExtension = urlParams.get('ref') === 'install';

  const isEngineer = !!experienceLevel && experienceLevel !== 'NOT_ENGINEER';
  if (typeof globalThis.gtag === 'function') {
    globalThis.gtag('event', 'signup');
    if (isEngineer) {
      globalThis.gtag('event', 'engineer_signup');
    }
    if (isExtension) {
      globalThis.gtag('event', 'extension_signup');
    }
  }

  if (typeof globalThis.fbq === 'function') {
    globalThis.fbq('track', 'signup');
    const seniority = EXPERIENCE_TO_SENIORITY[experienceLevel];
    if (seniority) {
      globalThis.fbq('track', `signup3_${seniority}`);
    }
    if (isEngineer) {
      globalThis.fbq('track', 'engineer signup');
    }
    if (isExtension) {
      globalThis.fbq('track', 'extension_signup');
    }
  }

  if (typeof globalThis.twq === 'function') {
    globalThis.twq('event', 'tw-o6izs-okoq6', {});
  }

  if (typeof globalThis.rdt === 'function') {
    globalThis.rdt('track', 'SignUp');
  }

  if (typeof globalThis.ttq?.track === 'function') {
    globalThis.ttq.track('CompletePayment', { value: 1 });
  }
};

export const logPixelPayment = (
  value: number,
  currency: string,
  transactionId: string,
): void => {
  if (typeof globalThis.gtag === 'function') {
    globalThis.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
    });
  }

  if (typeof globalThis.fbq === 'function') {
    globalThis.fbq('track', 'Purchase', {
      value,
      currency,
    });
  }
};

export const Pixels = ({ hotjarId }: Partial<HotjarProps>): ReactElement => {
  const { cookieExists: acceptedMarketing } = useConsentCookie(
    GdprConsentKey.Marketing,
  );
  const { user, anonymous, isAuthReady, isGdprCovered } = useAuthContext();
  const userId = user?.id || anonymous?.id;

  const { query } = useRouter();
  const instanceId = query?.aiid?.toString();

  const consent = !isGdprCovered || acceptedMarketing;
  const props: PixelProps = { userId, instanceId, consent };

  if (!isProduction || !userId || !isAuthReady) {
    return null;
  }

  return (
    <>
      {hotjarId && <HotJarTracking hotjarId={hotjarId} />}
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
