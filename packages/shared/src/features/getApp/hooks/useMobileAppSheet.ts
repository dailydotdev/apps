import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
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
  const isEligible =
    isPhoneBrowser && isLoggedIn && !isNewAccount(user?.createdAt);
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
