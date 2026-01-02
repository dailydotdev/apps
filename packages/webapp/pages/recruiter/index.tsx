import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { RecruiterHeader } from '@dailydotdev/shared/src/components/recruiter/Header';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '@dailydotdev/shared/src/components/recruiter/Progress';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { OpportunityPreviewProvider } from '@dailydotdev/shared/src/features/opportunity/context/OpportunityPreviewContext';
import type { PendingSubmission } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { usePendingSubmission } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { mockOpportunityPreviewData } from '@dailydotdev/shared/src/features/opportunity/mockData';
import type { OpportunityPreviewContextType } from '@dailydotdev/shared/src/features/opportunity/context/OpportunityPreviewContext';
import { AnalyzeContent } from '@dailydotdev/shared/src/features/opportunity/components/analyze/AnalyzeContent';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getOpportunitiesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

const useLoadingAnimation = (isActive: boolean) => {
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setLoadingStep(0);
      return undefined;
    }

    const timers = [
      setTimeout(() => setLoadingStep(1), 800),
      setTimeout(() => setLoadingStep(2), 1600),
      setTimeout(() => setLoadingStep(3), 2400),
      setTimeout(() => setLoadingStep(4), 3200),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return loadingStep;
};

function RecruiterPage(): ReactElement {
  const router = useRouter();
  const { openModal, closeModal } = useLazyModal();
  const { setPendingSubmission } = usePendingSubmission();
  const { user, loadingUser } = useAuthContext();
  const hasInitializedRef = useRef(false);

  // Check if user already has opportunities (jobs)
  const { data: opportunitiesData, isLoading: isLoadingOpportunities } =
    useQuery({
      ...getOpportunitiesOptions(),
      enabled: !!user,
    });
  const [mockData, setMockData] = useState<OpportunityPreviewContextType>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const loadingStep = useLoadingAnimation(isAnimating);

  const navigateToAnalyze = useCallback(() => {
    closeModal();
    router.push(`/recruiter/new/analyze`);
  }, [closeModal, router]);

  // Use a ref so the modal always calls the latest version of this function
  // This avoids stale closures since the modal captures the callback when opened
  const handleJobSubmitRef = useRef<(submission: PendingSubmission) => void>();
  handleJobSubmitRef.current = (submission: PendingSubmission) => {
    setPendingSubmission(submission);
    closeModal();

    if (!user) {
      // Show mock data to make it look like processing is happening,
      // encouraging the user to sign up
      setMockData(mockOpportunityPreviewData);
      setIsAnimating(true);
      openModal({
        type: LazyModal.RecruiterSignIn,
        props: {
          onSuccess: navigateToAnalyze,
        },
      });
    } else {
      navigateToAnalyze();
    }
  };

  const openJobLinkModal = useCallback(() => {
    openModal({
      type: LazyModal.RecruiterJobLink,
      props: {
        onSubmit: (submission: PendingSubmission) =>
          handleJobSubmitRef.current?.(submission),
      },
    });
  }, [openModal]);

  const hasExistingOpportunities =
    opportunitiesData?.edges && opportunitiesData.edges.length > 0;

  // Open the appropriate modal when the page loads
  useEffect(() => {
    const { openModal: openModalParam } = router.query;
    // If openModal=joblink query param is present, skip intro/trust modals
    if (openModalParam === 'joblink') {
      // Clear the query param from URL without triggering navigation
      router.replace('/recruiter', undefined, { shallow: true });
      openJobLinkModal();
      return;
    }

    if ((user && isLoadingOpportunities) || loadingUser) {
      return;
    }

    // Only run initialization once to prevent re-opening modals on navigation
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    if (hasExistingOpportunities) {
      openJobLinkModal();
      return;
    }

    // Default flow: start with intro modal
    openModal({
      type: LazyModal.RecruiterIntro,
      props: {
        onNext: () => {
          closeModal();
          openModal({
            type: LazyModal.RecruiterTrust,
            props: {
              onNext: () => {
                closeModal();
                openJobLinkModal();
              },
            },
          });
        },
      },
    });
  }, [
    openModal,
    closeModal,
    router,
    openJobLinkModal,
    user,
    isLoadingOpportunities,
    hasExistingOpportunities,
    loadingUser,
  ]);

  return (
    <OpportunityPreviewProvider mockData={mockData}>
      <div className="flex flex-1 flex-col">
        <RecruiterHeader />
        <RecruiterProgress activeStep={RecruiterProgressStep.AnalyzeAndMatch} />
        <AnalyzeContent loadingStep={loadingStep} />
      </div>
    </OpportunityPreviewProvider>
  );
}

RecruiterPage.getLayout = getLayout;
RecruiterPage.layoutProps = {
  className: { main: 'pointer-events-none blur-sm' },
};

export async function getServerSideProps() {
  return { props: {} };
}

export default RecruiterPage;
