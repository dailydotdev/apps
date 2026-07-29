/* eslint-disable no-underscore-dangle -- _iub is iubenda's mandated global */
import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { featureIubendaCmp } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  cookieAcknowledgedKey,
  GdprConsentKey,
  otherGdprConsents,
} from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { useConsentCookie } from '@dailydotdev/shared/src/hooks/useCookieConsent';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import { startTcfSubscription } from '@dailydotdev/shared/src/lib/tcf';

/**
 * Loads the iubenda Cookie Solution (IAB TCF mode) for GDPR-covered users and
 * mirrors its consent into the first-party `ilikecookies*` cookies so all
 * existing gating (Pixels, settings, ad consent fallback) keeps working.
 * The homegrown banner is suppressed for these users in `useCookieBanner`.
 */

type IubendaPreference = {
  purposes?: Record<string, boolean>;
};

type IubendaWindow = typeof globalThis & {
  _iub?: {
    csConfiguration?: Record<string, unknown>;
    cs?: { api?: { openPreferences?: () => void } };
  };
};

const IUBENDA_SCRIPTS = [
  'https://cdn.iubenda.com/cs/tcf/stub-v2.js',
  'https://cdn.iubenda.com/cs/tcf/safe-tcf-v2.js',
  'https://cdn.iubenda.com/cs/iubenda_cs.js',
];

export const openIubendaPreferences = (): boolean => {
  const api = (globalThis as IubendaWindow)._iub?.cs?.api;

  if (!api?.openPreferences) {
    return false;
  }

  api.openPreferences();
  return true;
};

export const Iubenda = (): ReactElement | null => {
  const { isAuthReady, isGdprCovered, isFunnel } = useAuthContext();
  const cmpEnabled = useFeature(featureIubendaCmp);
  const { saveCookies } = useConsentCookie(GdprConsentKey.Necessary);
  const injectedRef = useRef(false);

  // The config callback must not go stale when React re-renders.
  const onPreferenceRef = useRef<(pref: IubendaPreference) => void>();
  onPreferenceRef.current = (pref) => {
    const marketing = pref?.purposes?.['5'] === true;
    saveCookies(
      marketing ? otherGdprConsents : [],
      marketing ? [] : otherGdprConsents,
    );
    globalThis?.localStorage?.setItem(cookieAcknowledgedKey, 'true');
  };

  const enabled =
    isAuthReady && isGdprCovered && cmpEnabled && !isFunnel && !isIOSNative();

  useEffect(() => {
    if (!enabled || injectedRef.current) {
      return;
    }

    const win = globalThis as IubendaWindow;

    if (win._iub?.csConfiguration) {
      return;
    }

    injectedRef.current = true;

    win._iub = win._iub || {};
    win._iub.csConfiguration = {
      siteId: Number(process.env.NEXT_PUBLIC_IUBENDA_SITE_ID),
      cookiePolicyId: Number(process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID),
      lang: 'en',
      enableTcf: true,
      googleAdditionalConsentMode: true,
      perPurposeConsent: true,
      askConsentAtCookiePolicyUpdate: true,
      invalidateConsentWithoutLog: true,
      // consent cookie shared across *.daily.dev, matching the existing
      // `_iub_cs-*` bridge from the marketing homepage
      localConsentDomain: process.env.NEXT_PUBLIC_DOMAIN,
      floatingPreferencesButtonDisplay: false,
      banner: {
        position: 'float-bottom-center',
        acceptButtonDisplay: true,
        rejectButtonDisplay: true,
        customizeButtonDisplay: true,
        closeButtonDisplay: false,
        listPurposes: true,
      },
      callback: {
        onPreferenceExpressed: (pref: IubendaPreference) =>
          onPreferenceRef.current?.(pref),
      },
    };

    IUBENDA_SCRIPTS.forEach((src, index) => {
      const script = document.createElement('script');
      script.src = src;
      // dynamically injected scripts default to async; force in-order
      // execution — iubenda requires the TCF stub before the core script
      script.async = false;
      if (index === 0) {
        // __tcfapi only exists once the stub executes; the stub then queues
        // the subscription until the core script loads
        script.onload = () => startTcfSubscription();
      }
      document.head.appendChild(script);
    });
  }, [enabled]);

  return null;
};
