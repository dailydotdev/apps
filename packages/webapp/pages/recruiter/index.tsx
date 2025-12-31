import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
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
import { AnalyzeContent } from '@dailydotdev/shared/src/features/opportunity/components/analyze/AnalyzeContent';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

function RecruiterPage(): ReactElement {
  const router = useRouter();
  const { openModal, closeModal } = useLazyModal();
  const { setPendingSubmission } = usePendingSubmission();
  const { user } = useAuthContext();
  const hasInitializedRef = useRef(false);

  const navigateToAnalyze = useCallback(() => {
    closeModal();
    router.push(`/recruiter/new/analyze`);
  }, [closeModal, router]);

  const handleJobSubmit = useCallback(
    (submission: PendingSubmission) => {
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
    },
    [setPendingSubmission, closeModal, user, openModal, navigateToAnalyze],
  );

  const openJobLinkModal = useCallback(() => {
    openModal({
      type: LazyModal.RecruiterJobLink,
      props: {
        onSubmit: handleJobSubmit,
      },
    });
  }, [openModal, handleJobSubmit]);

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

    // Only run initialization once to prevent re-opening modals on navigation
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

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
  }, [openModal, closeModal, router, openJobLinkModal]);

  return (
    <OpportunityPreviewProvider mockData={mockOpportunityPreviewData}>
      <div className="flex flex-1 flex-col">
        <RecruiterHeader />
        <RecruiterProgress activeStep={RecruiterProgressStep.AnalyzeAndMatch} />
        <AnalyzeContent loadingStep={4} />
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
