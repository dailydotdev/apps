import { useEffect } from 'react';
import type { AcceptCookiesCallback } from '../../../hooks/useCookieConsent';
import { useConsentCookie } from '../../../hooks/useCookieConsent';
import type { FunnelEvent } from '../types/funnelEvents';
import { FunnelEventName } from '../types/funnelEvents';
import { useAuthContext } from '../../../contexts/AuthContext';
import { GdprConsentKey } from '../../../hooks/useCookieBanner';

interface UseFunnelCookiesProps {
  defaultOpen?: boolean;
  trackFunnelEvent: (event: FunnelEvent) => void;
}

interface UseFunnelCookiesReturn {
  showBanner: boolean;
  onAccepted: AcceptCookiesCallback;
}

export const useFunnelCookies = ({
  defaultOpen = false,
  trackFunnelEvent,
}: UseFunnelCookiesProps): UseFunnelCookiesReturn => {
  const { isAuthReady, isGdprCovered } = useAuthContext();
  const { cookieExists, saveCookies } = useConsentCookie(
    GdprConsentKey.Marketing,
  );
  const needCookies = isGdprCovered && !cookieExists;
  const showBanner = isAuthReady ? needCookies : defaultOpen;

  useEffect(
    () => {
      if (showBanner) {
        trackFunnelEvent({
          name: FunnelEventName.CookieConsentView,
          details: {
            target_id: isGdprCovered ? 'gdpr' : 'non-gdpr',
          },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showBanner],
  );

  return {
    showBanner,
    onAccepted: (consents) => {
      const hasAccepted = !!consents?.length;
      saveCookies(consents);
      trackFunnelEvent({
        name: hasAccepted
          ? FunnelEventName.AcceptCookieConsent
          : FunnelEventName.RejectCookieConsent,
      });
    },
  };
};
