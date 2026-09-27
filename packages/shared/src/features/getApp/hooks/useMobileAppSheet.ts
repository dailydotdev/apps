import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../../hooks/usePersistentContext';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { featureMobileAppSheet } from '../../../lib/featureManagement';
import { isIOSNative } from '../../../lib/func';
import { oneDay } from '../../../lib/dateFormat';

interface MobileAppSheetDismissal {
  dismissedAt: number;
  continues: number;
}

interface UseMobileAppSheet {
  isOpen: boolean;
  onOpenApp: () => void;
  onContinue: () => void;
}

const pageViewsKey = 'mobile_app_sheet_views';
const pageViewsBeforeSheet = 2;
const snoozeDays = 7;
const continuesBeforeLongSnooze = 3;
const longSnoozeDays = 90;

const countPageView = (page: string): number => {
  try {
    const { last, count = 0 } = JSON.parse(
      sessionStorage.getItem(pageViewsKey) ?? '{}',
    ) as { last?: string; count?: number };
    if (last === page) {
      return count;
    }
    sessionStorage.setItem(
      pageViewsKey,
      JSON.stringify({ last: page, count: count + 1 }),
    );
    return count + 1;
  } catch {
    return 0;
  }
};

const isSnoozed = (dismissal: MobileAppSheetDismissal | null): boolean => {
  if (!dismissal) {
    return false;
  }

  const days =
    dismissal.continues >= continuesBeforeLongSnooze
      ? longSnoozeDays
      : snoozeDays;
  return Date.now() - dismissal.dismissedAt < days * oneDay * 1000;
};

// Logged-in phones only, from the second page view of a session. Continue
// hides it for 7 days; the third Continue hides it for 90.
export const useMobileAppSheet = (): UseMobileAppSheet => {
  const router = useRouter();
  const { isAuthReady, isLoggedIn, isAndroidApp } = useAuthContext();
  const isTablet = useViewSize(ViewSize.Tablet);
  const [dismissal, setDismissal, isLoaded] =
    usePersistentContext<MobileAppSheetDismissal>(
      PersistentContextKeys.MobileAppSheet,
    );
  const [pageViews, setPageViews] = useState(0);
  const page = router?.asPath?.split('#')[0];

  useEffect(() => {
    if (page) {
      setPageViews(countPageView(page));
    }
  }, [page]);

  const shouldEvaluate =
    isAuthReady &&
    isLoggedIn &&
    !isTablet &&
    !isAndroidApp &&
    !isIOSNative() &&
    isLoaded &&
    !isSnoozed(dismissal) &&
    pageViews >= pageViewsBeforeSheet;
  const { value: isEnabled } = useConditionalFeature({
    feature: featureMobileAppSheet,
    shouldEvaluate,
  });

  const dismiss = (continued: boolean) =>
    setDismissal({
      dismissedAt: Date.now(),
      continues: (dismissal?.continues ?? 0) + (continued ? 1 : 0),
    });

  return {
    isOpen: shouldEvaluate && isEnabled,
    onOpenApp: () => dismiss(false),
    onContinue: () => dismiss(true),
  };
};
