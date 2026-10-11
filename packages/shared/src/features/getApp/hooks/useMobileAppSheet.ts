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
// one, so a missing banner (blocked, or not set up on a preview) does not
// hold it forever. A banner that is up still holds it until answered.
export const consentBannerGraceMs = 4000;
const consentBannerPollMs = 1000;

const isConsentBannerVisible = (): boolean =>
  !!document.querySelector('#iubenda-cs-banner.iubenda-cs-visible');

const useIsConsentSettled = (): boolean => {
  const { cookieExists } = useConsentCookie(GdprConsentKey.Necessary);
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    if (cookieExists || isSettled) {
      return undefined;
    }

    const startedAt = Date.now();
    // Polls only until it settles: past the grace period with no banner up.
    const interval = window.setInterval(() => {
      if (
        Date.now() - startedAt >= consentBannerGraceMs &&
        !isConsentBannerVisible()
      ) {
        setIsSettled(true);
      }
    }, consentBannerPollMs);

    return () => window.clearInterval(interval);
  }, [cookieExists, isSettled]);

  return cookieExists || isSettled;
};

// A new account's first hours belong to its feed, not to an app pitch.
export const MOBILE_APP_SHEET_MIN_ACCOUNT_AGE_HOURS = 12;

const isNewAccount = (createdAt?: string): boolean =>
  !!createdAt &&
  Date.now() - new Date(createdAt).getTime() <
    MOBILE_APP_SHEET_MIN_ACCOUNT_AGE_HOURS * oneHour;

export const useMobileAppSheet = (): UseMobileAppSheet => {
  const { isLoggedIn, user } = useAuthContext();
  const isPhoneBrowser = usePhoneBrowser();
  const [dismissal, setDismissal, isLoaded] =
    usePersistentContext<MobileAppSheetDismissal>(
      PersistentContextKeys.MobileAppSheet,
    );
  // One sheet at a time, consent first.
  const isConsentSettled = useIsConsentSettled();
  const isEligible =
    isPhoneBrowser &&
    isLoggedIn &&
    isConsentSettled &&
    !isNewAccount(user?.createdAt);
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
