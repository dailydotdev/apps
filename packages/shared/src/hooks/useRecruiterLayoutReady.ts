import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { useGrowthBookContext } from '../components/GrowthBookProvider';
import { isTesting, recruiterUrl } from '../lib/constants';

interface UseRecruiterLayoutReadyResult {
  isPageReady: boolean;
}

export const useRecruiterLayoutReady = (): UseRecruiterLayoutReadyResult => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const { growthbook } = useGrowthBookContext();

  const isPageReady =
    (growthbook?.ready && router?.isReady && isAuthReady) || isTesting;

  const isIndexPage = router.pathname === '/recruiter';
  const shouldRedirect = !user && isPageReady && !isTesting && !isIndexPage;

  useEffect(() => {
    if (!shouldRedirect) {
      return;
    }

    router.push(recruiterUrl);
  }, [shouldRedirect, router]);

  return { isPageReady: isPageReady && !shouldRedirect };
};
