import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
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
import { mockAnonymousUserTableData } from '@dailydotdev/shared/src/features/opportunity/mockData';
import { ContentSidebar } from '@dailydotdev/shared/src/features/opportunity/components/analyze/ContentSidebar';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

function RecruiterPage(): ReactElement {
  const router = useRouter();
  const { openModal, closeModal } = useLazyModal();

  // Open the intro modal when the page loads
  useEffect(() => {
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
                openModal({
                  type: LazyModal.RecruiterJobLink,
                  props: {
                    onSubmit: (opportunity) => {
                      closeModal();
                      router.push(
                        `${webappUrl}recruiter/${opportunity.id}/analyze`,
                      );
                    },
                  },
                });
              },
            },
          });
        },
      },
    });
  }, [openModal, closeModal, router]);

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
