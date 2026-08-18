/* eslint-disable no-underscore-dangle -- _iub is iubenda's mandated global */
import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
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
  const { isAuthReady, isTcfCovered, isFunnel } = useAuthContext();
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

  const enabled = isAuthReady && isTcfCovered && !isFunnel && !isIOSNative();

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
    const tokens = getComputedStyle(document.documentElement);
    // Aligned with the marketing homepage's embed (same siteId/cookiePolicyId,
    // countryDetection, LGPD/USPR) so both surfaces treat consent the same.
    // Deliberate differences: enableTcf + ACM (the point of this integration)
    // and no floating button (settings/privacy is the re-entry point).
    win._iub.csConfiguration = {
      siteId: Number(process.env.NEXT_PUBLIC_IUBENDA_SITE_ID),
      cookiePolicyId: Number(process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID),
      lang: 'en',
      enableTcf: true,
      googleAdditionalConsentMode: true,
      perPurposeConsent: true,
      askConsentAtCookiePolicyUpdate: true,
      invalidateConsentWithoutLog: true,
      countryDetection: true,
      enableLgpd: true,
      enableUspr: true,
      cookiePolicyInOtherWindow: true,
      // consent cookie shared across *.daily.dev so the homepage recognizes
      // webapp consent; the homepage embed should add this too for the
      // reverse direction (its cookie is host-only today)
      localConsentDomain: process.env.NEXT_PUBLIC_DOMAIN,
      floatingPreferencesButtonDisplay: false,
      banner: {
        position: 'float-bottom-right',
        // iubenda writes these three inline with !important, so unlike the
        // rest of the card (styles/components/iubenda.css) they can't come
        // from the stylesheet; read the tokens so they follow the active
        // theme
        backgroundColor:
          tokens.getPropertyValue('--theme-accent-pepper-subtlest').trim() ||
          '#161921',
        textColor:
          tokens.getPropertyValue('--theme-text-secondary').trim() || '#CDD4E4',
        fontSize: '13px',
        acceptButtonDisplay: true,
        rejectButtonDisplay: true,
        customizeButtonDisplay: true,
        closeButtonDisplay: false,
        listPurposes: true,
      },
      callback: {
        onPreferenceExpressed: (pref: IubendaPreference) =>
          onPreferenceRef.current?.(pref),
        onBannerShown: () => {
          document
            .querySelector('#iubenda-cs-banner .iubenda-banner-content')
            ?.dispatchEvent(new Event('scroll'));
        },
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
