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
  const isAnalyzePage =
    router.pathname === '/recruiter/[opportunityId]/analyze';
  const shouldRedirect =
    // we support public access for some opportunities with public_draft flag on API side
    !user && isPageReady && !isTesting && !isIndexPage && !isAnalyzePage;

  useEffect(() => {
    if (!shouldRedirect) {
      return;
    }

    router.push(recruiterUrl);
  }, [shouldRedirect, router]);

  return { isPageReady: isPageReady && !shouldRedirect };
};
