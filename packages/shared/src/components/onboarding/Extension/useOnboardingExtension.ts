import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { checkIsBrowser, UserAgent } from '../../../lib/func';
import { useActions, useViewSize, ViewSize } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';

interface UseOnboardingExtension {
  hasCheckedExtension: boolean;
  shouldShowExtensionOnboarding: boolean;
  browser: {
    isChrome: boolean;
    isEdge: boolean;
  };
}

export const useOnboardingExtension = (): UseOnboardingExtension => {
  const router = useRouter();
  const isComingFromExtension = router.query.ref === 'install';

  const isChrome = checkIsBrowser(UserAgent.Chrome);
  const isEdge = checkIsBrowser(UserAgent.Edge);
  const isValidBrowser = isChrome || isEdge;

  const isLaptop = useViewSize(ViewSize.Laptop);

  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  const hasCheckedExtension =
    isActionsFetched && checkHasCompleted(ActionType.BrowserExtension);

  const shouldShowExtensionOnboarding =
    isLaptop &&
    isValidBrowser &&
    isActionsFetched &&
    !hasCheckedExtension &&
    !isComingFromExtension;

  useEffect(() => {
    if (isComingFromExtension && isActionsFetched && !hasCheckedExtension) {
      completeAction(ActionType.BrowserExtension);
    }
  }, [
    completeAction,
    hasCheckedExtension,
    isActionsFetched,
    isComingFromExtension,
  ]);

  return {
    hasCheckedExtension,
    shouldShowExtensionOnboarding,
    browser: {
      isChrome,
      isEdge,
    },
  };
};
