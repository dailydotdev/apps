import React, { ReactElement } from 'react';
import Script from 'next/script';
import { isProduction } from '../../lib/constants';
import { UserExperienceLevel } from '../../lib/user';

const FB_PIXEL_ID = '519268979315924';
const GA_TRACKING_ID = 'G-VTGLXD7QSN';
const TWITTER_TRACKING_ID = 'o6izs';
const REDDIT_TRACKING_ID = 't2_j1li1n7e';
const TIKTOK_TRACKING_ID = 'CO2RCPBC77U37LT1TAIG';

export type OnboardingLogsProps = {
  instanceId?: string;
  userId?: string;
};

const FbTracking = ({ userId }: OnboardingLogsProps): ReactElement => {
  return (
    <>
      <Script
        id="fb-pixel"
        src="/scripts/fb.js"
        strategy="afterInteractive"
        data-pixel-id={FB_PIXEL_ID}
        data-user-id={userId}
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
}: OnboardingLogsProps): ReactElement => {
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
        data-user-id={userId}
        data-instance-id={instanceId}
      />
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HotJarTracking = (): ReactElement => {
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

const TwitterTracking = (): ReactElement => {
  return (
    <Script
      id="twitter-pixel"
      src="/scripts/twitter.js"
      strategy="afterInteractive"
      data-twitter-id={TWITTER_TRACKING_ID}
    />
  );
};

const RedditTracking = (): ReactElement => {
  return (
    <Script
      id="reddit-pixel"
      src="/scripts/reddit.js"
      strategy="afterInteractive"
      data-reddit-id={REDDIT_TRACKING_ID}
    />
  );
};

const TiktokTracking = (): ReactElement => {
  return (
    <Script
      id="tiktok-pixel"
      src="/scripts/tiktok.js"
      strategy="afterInteractive"
      data-tiktok-id={TIKTOK_TRACKING_ID}
    />
  );
};

interface LogSignUpProps {
  experienceLevel: keyof typeof UserExperienceLevel;
}

const EXPERIENCE_TO_SENIORITY: Record<
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

export const logSignUp = ({ experienceLevel }: LogSignUpProps): void => {
  const isEngineer = !!experienceLevel && experienceLevel !== 'NOT_ENGINEER';
  if (typeof globalThis.gtag === 'function') {
    globalThis.gtag('event', 'signup');
    if (isEngineer) {
      globalThis.gtag('event', 'engineer_signup');
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

export const OnboardingLogs = (props: OnboardingLogsProps): ReactElement => {
  const { userId } = props;
  if (!isProduction || !userId) {
    return null;
  }

  return (
    <>
      <FbTracking {...props} />
      <GtagTracking {...props} />
      <TiktokTracking />
      <TwitterTracking />
      <RedditTracking />
    </>
  );
};
