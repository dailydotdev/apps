import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { checkIsBrowser, UserAgent } from '../../../lib/func';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';

export const useOnboardingExtension = () => {
  const router = useRouter();
  const isComingFromExtension = router.query.ref === 'install';

  const isChrome = checkIsBrowser(UserAgent.Chrome);
  const isEdge = checkIsBrowser(UserAgent.Edge);
  const isValidBrowser = isChrome || isEdge;

  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  const hasCheckedExtension = checkHasCompleted(ActionType.BrowserExtension);

  const shouldShowExtensionOnboarding =
    isValidBrowser &&
    isActionsFetched &&
    !hasCheckedExtension &&
    isComingFromExtension;

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
