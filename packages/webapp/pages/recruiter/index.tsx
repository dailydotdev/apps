import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import type { PendingSubmission } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { usePendingSubmission } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getOpportunitiesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import {
  Typography,
  TypographyColor,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DashboardView } from '@dailydotdev/shared/src/features/recruiter/components/DashboardView';
import { OnboardingView } from '@dailydotdev/shared/src/features/recruiter/components/OnboardingView';
import usePersistentContext, {
  PersistentContextKeys,
} from '@dailydotdev/shared/src/hooks/usePersistentContext';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  getLayout,
  layoutProps,
} from '../../components/layouts/RecruiterFullscreenLayout';

function RecruiterPage(): ReactElement {
  const router = useRouter();
  const { openModal, closeModal } = useLazyModal();
  const { setPendingSubmission } = usePendingSubmission();
  const { user, loadingUser } = useAuthContext();
  const hasInitializedRef = useRef(false);
  const [pendingOpportunityId, setPendingOpportunityId] = usePersistentContext<
    string | null
  >(PersistentContextKeys.PendingOpportunityId, null);
  const [isNavigatingToAnalyze, setNavigatingToAnalyze] = useState(false);

  // Check if user already has opportunities (jobs)
  const { data: opportunitiesData, isLoading: isLoadingOpportunities } =
    useQuery({
      ...getOpportunitiesOptions(),
      enabled: !!user,
    });
  const navigateToAnalyze = useCallback(async () => {
    setNavigatingToAnalyze(true);

    if (pendingOpportunityId) {
      setPendingOpportunityId(null);
      await router.push(
        `${webappUrl}recruiter/${pendingOpportunityId}/analyze`,
      );
    } else {
      await router.push(`${webappUrl}recruiter/new/analyze`);
    }

    closeModal();
  }, [closeModal, pendingOpportunityId, setPendingOpportunityId, router]);

  // Use a ref so the modal always calls the latest version of this function
  // This avoids stale closures since the modal captures the callback when opened
  const handleJobSubmitRef = useRef<(submission: PendingSubmission) => void>();
  handleJobSubmitRef.current = (submission: PendingSubmission) => {
    setPendingSubmission(submission);
    closeModal();

    if (!user) {
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
    ({
      closeable = false,
      initialUrl,
      autoSubmit = false,
    }: {
      closeable?: boolean;
      initialUrl?: string;
      autoSubmit?: boolean;
    } = {}) => {
      openModal({
        type: LazyModal.RecruiterJobLink,
        props: {
          closeable,
          initialUrl,
          autoSubmit,
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
    const { openModal: openModalParam, closeable, url } = router.query;

    // If url query param is present, open modal with pre-filled URL and auto-submit
    if (url && typeof url === 'string') {
      openJobLinkModal({ initialUrl: url, autoSubmit: true });
      return;
    }

    // If openModal=joblink query param is present, skip intro/trust modals
    if (openModalParam === 'joblink') {
      openJobLinkModal({ closeable: closeable === '1' });
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

  if (isNavigatingToAnalyze) {
    return (
      <div className="relative flex flex-1">
        <OnboardingView />
        <Loader
          invertColor
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    );
  }

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
        onAddNew={() => openJobLinkModal({ closeable: true })}
      />
    );
  }

  // Onboarding flow for new users (with blur effect)
  return <OnboardingView />;
}

RecruiterPage.getLayout = getLayout;
RecruiterPage.layoutProps = layoutProps;

export async function getServerSideProps() {
  return { props: {} };
}

export default RecruiterPage;
