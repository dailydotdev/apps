import { useEffect, useState } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { GdprConsentKey } from '../../../hooks/useCookieBanner';
import { useConsentCookie } from '../../../hooks/useCookieConsent';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../../hooks/usePersistentContext';
import {
  featureMobileAppSheet,
  featureMobileAppSheetSnoozeHours,
} from '../../../lib/featureManagement';
import { usePhoneBrowser } from './usePhoneBrowser';

interface MobileAppSheetDismissal {
  dismissedAt: number;
}

interface UseMobileAppSheet {
  isOpen: boolean;
  onDismiss: () => void;
}

const oneHour = 60 * 60 * 1000;

// How long the sheet waits for a consent answer before going ahead without
// one. Without a banner (blocked by the browser, not set up on a preview, not
// shown on this route) nothing would ever record an answer, and the sheet
// would never show. A banner that is up, or comes up later, still holds the
// sheet until it is answered.
export const consentBannerGraceMs = 4000;
const consentBannerPollMs = 1000;

const isConsentBannerVisible = (): boolean =>
  !!document.querySelector('#iubenda-cs-banner.iubenda-cs-visible');

const useIsConsentSettled = (): boolean => {
  const { cookieExists } = useConsentCookie(GdprConsentKey.Necessary);
  const [isGraceOver, setIsGraceOver] = useState(false);
  const [isBannerUp, setIsBannerUp] = useState(false);

  useEffect(() => {
    if (cookieExists) {
      return undefined;
    }

    // A cheap id lookup once a second, until the banner records an answer.
    const check = () => setIsBannerUp(isConsentBannerVisible());
    check();
    const interval = window.setInterval(check, consentBannerPollMs);
    const timeout = window.setTimeout(
      () => setIsGraceOver(true),
      consentBannerGraceMs,
    );

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [cookieExists]);

  return cookieExists || (isGraceOver && !isBannerUp);
};

export const useMobileAppSheet = (): UseMobileAppSheet => {
  const { isLoggedIn } = useAuthContext();
  const isPhoneBrowser = usePhoneBrowser();
  const [dismissal, setDismissal, isLoaded] =
    usePersistentContext<MobileAppSheetDismissal>(
      PersistentContextKeys.MobileAppSheet,
    );
  // One sheet at a time, consent first: the consent banner records its
  // answer (or that none is needed) in the necessary cookie; with no banner
  // up after a grace period there is nothing to wait for.
  const isConsentSettled = useIsConsentSettled();
  const isEligible = isPhoneBrowser && isLoggedIn && isConsentSettled;
  const { value: snoozeHours } = useConditionalFeature({
    feature: featureMobileAppSheetSnoozeHours,
    shouldEvaluate: isEligible && !!dismissal,
  });
  const isSnoozed =
    !!dismissal && Date.now() - dismissal.dismissedAt < snoozeHours * oneHour;
  const shouldEvaluate = isEligible && isLoaded && !isSnoozed;
  const { value: isEnabled } = useConditionalFeature({
    feature: featureMobileAppSheet,
    shouldEvaluate,
  });

  return {
    isOpen: shouldEvaluate && isEnabled,
    onDismiss: () => setDismissal({ dismissedAt: Date.now() }),
  };
};
