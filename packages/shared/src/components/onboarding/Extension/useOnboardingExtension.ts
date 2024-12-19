import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  checkIsBrowser,
  checkIsChromeOnly,
  UserAgent,
} from '../../../lib/func';
import { useActions, useViewSize, ViewSize } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { isBrave } from '../../../lib/constants';

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

  const isChrome = checkIsChromeOnly() || isBrave();
  const isEdge = checkIsBrowser(UserAgent.Edge);
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
    browser: {
      isChrome,
      isEdge,
    },
  };
};
