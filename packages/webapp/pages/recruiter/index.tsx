import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import type { PendingSubmission } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { usePendingSubmission } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { mockOpportunityPreviewData } from '@dailydotdev/shared/src/features/opportunity/mockData';
import type { OpportunityPreviewContextType } from '@dailydotdev/shared/src/features/opportunity/context/OpportunityPreviewContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getOpportunitiesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import {
  Typography,
  TypographyColor,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DashboardView } from '@dailydotdev/shared/src/features/recruiter/components/DashboardView';
import { OnboardingView } from '@dailydotdev/shared/src/features/recruiter/components/OnboardingView';
import { getLayout } from '../../components/layouts/RecruiterFullscreenLayout';

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

  const openJobLinkModal = useCallback(
    (closeable = false) => {
      openModal({
        type: LazyModal.RecruiterJobLink,
        props: {
          closeable,
          onSubmit: (submission: PendingSubmission) =>
            handleJobSubmitRef.current?.(submission),
        },
      });
    },
    [openModal],
  );

  const hasExistingOpportunities =
    opportunitiesData?.edges && opportunitiesData.edges.length > 0;

  // Open the onboarding modal flow for new users (no opportunities)
  useEffect(() => {
    const { openModal: openModalParam, closeable } = router.query;
    // If openModal=joblink query param is present, skip intro/trust modals
    if (openModalParam === 'joblink') {
      openJobLinkModal(closeable === '1');
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

    // Users with existing opportunities see the dashboard, no auto-modal
    if (hasExistingOpportunities) {
      return;
    }

    // Default flow for new users: start with intro modal
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

  const opportunities = opportunitiesData?.edges.map((edge) => edge.node) || [];

  // Loading state
  if ((user && isLoadingOpportunities) || loadingUser) {
    return (
      <div className="relative mx-4 mt-10 max-w-[47.875rem] tablet:mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <Typography color={TypographyColor.Tertiary}>
            Loading your opportunities...
          </Typography>
        </div>
      </div>
    );
  }

  // Dashboard view for users with existing opportunities
  if (hasExistingOpportunities) {
    return (
      <DashboardView
        opportunities={opportunities}
        onAddNew={() => openJobLinkModal(true)}
      />
    );
  }

  // Onboarding flow for new users (with blur effect)
  return <OnboardingView mockData={mockData} loadingStep={loadingStep} />;
}

RecruiterPage.getLayout = getLayout;

export async function getServerSideProps() {
  return { props: {} };
}

export default RecruiterPage;
