import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { BrowserName, getCurrentBrowserName } from '../../../lib/func';
import { useActions, useViewSize, ViewSize } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';

interface UseOnboardingExtension {
  hasCheckedExtension: boolean;
  shouldShowExtensionOnboarding: boolean;
  browserName: BrowserName;
}

export const useOnboardingExtension = (): UseOnboardingExtension => {
  const router = useRouter();
  const isComingFromExtension = router.query.ref === 'install';

  const browserName = getCurrentBrowserName();
  const isChrome = [BrowserName.Chrome, BrowserName.Brave].includes(
    browserName,
  );
  const isEdge = BrowserName.Edge === browserName;
  const isValidBrowser = isChrome || isEdge;

  const isLaptop = useViewSize(ViewSize.Laptop);

  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  const isCheckedExtension =
    isActionsFetched && checkHasCompleted(ActionType.BrowserExtension);

  const shouldShowExtensionOnboarding =
    isLaptop &&
    isValidBrowser &&
    isActionsFetched &&
    !isCheckedExtension &&
    !isComingFromExtension;

  useEffect(() => {
    if (isComingFromExtension && isActionsFetched && !isCheckedExtension) {
      completeAction(ActionType.BrowserExtension);
    }
  }, [
    completeAction,
    isCheckedExtension,
    isActionsFetched,
    isComingFromExtension,
  ]);

  return {
    hasCheckedExtension: isCheckedExtension,
    shouldShowExtensionOnboarding,
    browserName,
  };
};
