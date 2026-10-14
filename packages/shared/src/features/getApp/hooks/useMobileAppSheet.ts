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
// hold it forever. A banner that is up, or comes up later, still holds it.
export const consentBannerGraceMs = 4000;
const consentBannerPollMs = 1000;
// Past this, a consent script that has not loaded will not show a banner,
// so the poll stops.
export const consentScriptTimeoutMs = 30000;

const isConsentBannerVisible = (): boolean =>
  !!document.querySelector('#iubenda-cs-banner.iubenda-cs-visible');

const isConsentScriptLoaded = (): boolean =>
  // eslint-disable-next-line no-underscore-dangle
  !!(globalThis as { _iub?: { cs?: unknown } })._iub?.cs;

const useIsConsentSettled = (): boolean => {
  const { cookieExists } = useConsentCookie(GdprConsentKey.Necessary);
  const [isGraceOver, setIsGraceOver] = useState(false);
  const [isBannerUp, setIsBannerUp] = useState(false);

  useEffect(() => {
    if (cookieExists) {
      return undefined;
    }

    const startedAt = Date.now();
    let interval: number | undefined;
    const check = () => {
      setIsBannerUp(isConsentBannerVisible());
      if (
        Date.now() - startedAt >= consentScriptTimeoutMs &&
        !isConsentScriptLoaded()
      ) {
        window.clearInterval(interval);
      }
    };
    check();
    interval = window.setInterval(check, consentBannerPollMs);
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
