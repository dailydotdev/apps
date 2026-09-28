import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../../hooks/usePersistentContext';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import {
  featureMobileAppSheet,
  featureMobileAppSheetSnoozeHours,
} from '../../../lib/featureManagement';
import { isIOSNative } from '../../../lib/func';

interface MobileAppSheetDismissal {
  dismissedAt: number;
}

interface UseMobileAppSheet {
  isOpen: boolean;
  onDismiss: () => void;
}

const oneHour = 60 * 60 * 1000;

export const useMobileAppSheet = (): UseMobileAppSheet => {
  const { isAuthReady, isLoggedIn, isAndroidApp } = useAuthContext();
  const isTablet = useViewSize(ViewSize.Tablet);
  const [dismissal, setDismissal, isLoaded] =
    usePersistentContext<MobileAppSheetDismissal>(
      PersistentContextKeys.MobileAppSheet,
    );
  const isEligible =
    isAuthReady && isLoggedIn && !isTablet && !isAndroidApp && !isIOSNative();
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
