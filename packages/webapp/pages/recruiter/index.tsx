import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AnonymousUserTable } from '@dailydotdev/shared/src/components/recruiter/AnonymousUserTable';
import { RecruiterHeader } from '@dailydotdev/shared/src/components/recruiter/Header';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '@dailydotdev/shared/src/components/recruiter/Progress';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { OpportunityPreviewProvider } from '@dailydotdev/shared/src/features/opportunity/context/OpportunityPreviewContext';
import {
  usePendingSubmission,
  type PendingSubmission,
} from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { mockAnonymousUserTableData } from '@dailydotdev/shared/src/features/opportunity/mockData';
import { ContentSidebar } from '@dailydotdev/shared/src/features/opportunity/components/analyze/ContentSidebar';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

function RecruiterPage(): ReactElement {
  const router = useRouter();
  const { openModal, closeModal } = useLazyModal();
  const { setPendingSubmission } = usePendingSubmission();

  const handleJobSubmit = useCallback(
    (submission: PendingSubmission) => {
      setPendingSubmission(submission);
      closeModal();
      router.push(`/recruiter/new/analyze`);
    },
    [setPendingSubmission, closeModal, router],
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
    <OpportunityPreviewProvider mockData={mockAnonymousUserTableData}>
      <div className="flex flex-1 flex-col">
        <RecruiterHeader />
        <RecruiterProgress activeStep={RecruiterProgressStep.AnalyzeAndMatch} />
        <div className="flex flex-1">
          <ContentSidebar loadingStep={4} />
          <AnonymousUserTable />
        </div>
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
