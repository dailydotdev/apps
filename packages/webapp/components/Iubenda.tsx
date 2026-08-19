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
import { iubendaLocalizedPolicyIds } from '@dailydotdev/shared/src/lib/iubenda';
import { startTcfSubscription } from '@dailydotdev/shared/src/lib/tcf';
import { enhanceIubendaBannerNow, watchIubendaBanner } from './iubendaBanner';

/**
 * Loads the iubenda Cookie Solution (IAB TCF mode) for every visitor outside
 * the funnel and the iOS native wrapper; `countryDetection` +
 * `gdprAppliesGlobally:false` let iubenda decide which consent regime (if
 * any) applies, exactly like the marketing sites — where none does, no
 * banner shows. Expressed consent (or a "no consent needed" verdict) is
 * mirrored into the first-party `ilikecookies*` cookies so all existing
 * gating (Pixels, settings, ad consent fallback) keeps working.
 *
 * The configuration mirrors the marketing sites' embed (recruiter-landing,
 * custom-scripts/head.html) — same account, same policy, same first layer
 * (applyStyles:false + styles/iubenda.css + iubendaBanner.ts) —
 * so every daily.dev property shows one consent card. Deliberate deviations:
 * `localConsentDomain` (consent shared across *.daily.dev),
 * `invalidateConsentWithoutLog`, and no floating preferences badge —
 * settings/privacy is the in-app withdrawal entry point.
 */

type IubendaPreference = {
  purposes?: Record<string, boolean>;
};

type IubendaWindow = typeof globalThis & {
  _iub?: {
    csConfiguration?: Record<string, unknown>;
    csLangConfiguration?: Record<string, { cookiePolicyId: number }>;
    cs?: { api?: { openPreferences?: () => void } };
  };
};

// The consent-sync call comes first and the TCF stub before anything that
// could query `window.__tcfapi`, mirroring iubenda's dashboard snippet.
const getIubendaScripts = (siteId: string): string[] => [
  `https://cs.iubenda.com/sync/${siteId}.js`,
  'https://cdn.iubenda.com/cs/tcf/stub-v2.js',
  'https://cdn.iubenda.com/cs/tcf/safe-tcf-v2.js',
  'https://cdn.iubenda.com/cs/gpp/stub.js',
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
  const { isAuthReady, isFunnel } = useAuthContext();
  const { saveCookies } = useConsentCookie(GdprConsentKey.Necessary);
  const injectedRef = useRef(false);

  // The config callback must not go stale when React re-renders.
  const onPreferenceRef = useRef<(pref: IubendaPreference | null) => void>();
  onPreferenceRef.current = (pref) => {
    // a null preference means iubenda decided no consent regime applies to
    // this visitor's country — a green light, not a refusal
    const marketing = !pref || pref?.purposes?.['5'] === true;
    saveCookies(
      marketing ? otherGdprConsents : [],
      marketing ? [] : otherGdprConsents,
    );
    globalThis?.localStorage?.setItem(cookieAcknowledgedKey, 'true');
  };

  const enabled = isAuthReady && !isFunnel && !isIOSNative();

  useEffect(() => {
    if (!enabled || injectedRef.current) {
      return undefined;
    }

    const win = globalThis as IubendaWindow;

    if (win._iub?.csConfiguration) {
      // already injected by a previous mount; only the watcher needs restarting
      return watchIubendaBanner();
    }

    const siteId = process.env.NEXT_PUBLIC_IUBENDA_SITE_ID;
    const cookiePolicyId = Number(process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID);

    if (!siteId || !cookiePolicyId) {
      // eslint-disable-next-line no-console
      console.error(
        'iubenda env vars missing (NEXT_PUBLIC_IUBENDA_SITE_ID / NEXT_PUBLIC_IUBENDA_POLICY_ID): TCF-covered users get no consent banner in this environment',
      );
      return undefined;
    }

    injectedRef.current = true;

    win._iub = win._iub || {};
    win._iub.csConfiguration = {
      askConsentAtCookiePolicyUpdate: true,
      cookiePolicyInOtherWindow: true,
      countryDetection: true,
      enableLgpd: true,
      enableTcf: true,
      enableUspr: true,
      gdprAppliesGlobally: false,
      googleAdditionalConsentMode: true,
      inlineDelay: 100,
      perPurposeConsent: true,
      siteId: Number(siteId),
      tcfPurposes: {
        '2': 'consent_only',
        '7': 'consent_only',
        '8': 'consent_only',
        '9': 'consent_only',
        '10': 'consent_only',
        '11': 'consent_only',
      },
      whitelabel: false,
      cookiePolicyId,
      invalidateConsentWithoutLog: true,
      // consent cookie shared across *.daily.dev so the marketing sites
      // recognize webapp consent and vice versa
      localConsentDomain: process.env.NEXT_PUBLIC_DOMAIN,
      floatingPreferencesButtonDisplay: false,
      i18n: {
        en: {
          banner: {
            title: 'We value your privacy',
            dynamic: {
              body: 'This site uses cookies to improve your experience. By continuing to use our site, you accept our use of cookies, Privacy Policy, and Terms of Service.',
            },
          },
        },
      },
      banner: {
        // the first layer is styled by styles/iubenda.css; the
        // preferences modal keeps iubenda's own styles
        applyStyles: false,
        acceptButtonDisplay: true,
        closeButtonRejects: true,
        customizeButtonDisplay: true,
        customizeButtonCaption: 'Customize',
        rejectButtonDisplay: true,
        explicitWithdrawal: true,
        fontSizeBody: '12px',
        fontSizeCloseButton: '18px',
        logo: null,
        position: 'bottom',
        slideDown: false,
      },
      callback: {
        // fires on an expressed preference AND on "no consent needed" — the
        // only signal that separates a green light from a banner that has
        // not rendered yet
        onPreferenceExpressedOrNotNeeded: (pref: IubendaPreference | null) =>
          onPreferenceRef.current?.(pref),
        onBannerShown: () => {
          // catches banners the watcher missed (rendered past its cost cap)
          // and re-measures ones enhanced while still hidden
          enhanceIubendaBannerNow();
          // iubenda refuses consent while .iubenda-banner-content is
          // scrollable and not scrolled to bottom, and its setup can win the
          // race against our collapse class. Poking the listener resolves the
          // flag before the first click, so Accept/Reject never need pressing
          // twice.
          document
            .querySelector('#iubenda-cs-banner .iubenda-banner-content')
            ?.dispatchEvent(new Event('scroll'));
        },
      },
    };
    win._iub.csLangConfiguration = {
      en: { cookiePolicyId },
      ...Object.fromEntries(
        Object.entries(iubendaLocalizedPolicyIds).map(([lang, id]) => [
          lang,
          { cookiePolicyId: id },
        ]),
      ),
    };

    getIubendaScripts(siteId).forEach((src) => {
      const script = document.createElement('script');
      script.src = src;
      // dynamically injected scripts default to async; force in-order
      // execution — iubenda requires the TCF stub before the core script
      script.async = false;
      if (src.includes('tcf/stub-v2')) {
        // __tcfapi only exists once the stub executes; the stub then queues
        // the subscription until the core script loads
        script.onload = () => startTcfSubscription();
      }
      document.head.appendChild(script);
    });

    return watchIubendaBanner();
  }, [enabled]);

  return null;
};
