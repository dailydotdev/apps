import { useEffect, useMemo } from 'react';
import type { AcceptCookiesCallback } from '../../../hooks/useCookieConsent';
import { useConsentCookie } from '../../../hooks/useCookieConsent';
import type { FunnelEvent } from '../types/funnelEvents';
import { FunnelEventName } from '../types/funnelEvents';
import { GdprConsentKey } from '../../../hooks/useCookieBanner';
import { useFunnelBoot } from './useFunnelBoot';
import { checkIfGdprCovered } from '../../../contexts/AuthContext';

interface UseFunnelCookiesProps {
  defaultOpen?: boolean;
  trackFunnelEvent: (event: FunnelEvent) => void;
}

interface UseFunnelCookiesReturn {
  showBanner: boolean;
  onAccepted: AcceptCookiesCallback;
}

export const useFunnelCookies = ({
  defaultOpen: showBanner = false,
  trackFunnelEvent,
}: UseFunnelCookiesProps): UseFunnelCookiesReturn => {
  const { data: boot } = useFunnelBoot();
  const { saveCookies } = useConsentCookie(GdprConsentKey.Marketing);
  const isGdprCovered = useMemo(
    () => checkIfGdprCovered(boot?.geo),
    [boot?.geo],
  );

  useEffect(() => {
    if (showBanner) {
      trackFunnelEvent({
        name: FunnelEventName.CookieConsentView,
        details: {
          target_id: isGdprCovered ? 'gdpr' : 'non-gdpr',
        },
      });
    }
  }, [isGdprCovered, showBanner, trackFunnelEvent]);

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
