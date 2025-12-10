import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { RecruiterHeader } from '@dailydotdev/shared/src/components/recruiter/Header';
import { RecruiterProgress } from '@dailydotdev/shared/src/components/recruiter/Progress';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useRouter } from 'next/router';
import { OpportunityPreviewProvider } from '@dailydotdev/shared/src/features/opportunity/context/OpportunityPreviewContext';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { ContentSidebar } from '@dailydotdev/shared/src/features/opportunity/components/analyze/ContentSidebar';
import { UserTableWrapper } from '@dailydotdev/shared/src/features/opportunity/components/analyze/UserTableWrapper';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

const RecruiterPageContent = () => {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const router = useRouter();
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    // Always run the full loading animation sequence
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setLoadingStep(1), 800));
    timers.push(setTimeout(() => setLoadingStep(2), 1600));
    timers.push(setTimeout(() => setLoadingStep(3), 2400));
    timers.push(setTimeout(() => setLoadingStep(4), 3200));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handlePrepareCampaignClick = useCallback(() => {
    if (!user) {
      openModal({
        type: LazyModal.RecruiterSignIn,
      });
    } else {
      router.push('/recruiter/prepare');
    }
  }, [user, openModal, router]);

  return (
    <div className="flex flex-1 flex-col">
      <RecruiterHeader
        headerButton={{
          text: 'Prepare campaign',
          onClick: handlePrepareCampaignClick,
        }}
      />
      <RecruiterProgress />
      <div className="flex flex-1">
        <ContentSidebar loadingStep={loadingStep} apiUrl={apiUrl} />
        <UserTableWrapper loadingStep={loadingStep} />
      </div>
    </div>
  );
};

function RecruiterPage(): ReactElement {
  return (
    <OpportunityPreviewProvider>
      <RecruiterPageContent />
    </OpportunityPreviewProvider>
  );
}

RecruiterPage.getLayout = getLayout;

export async function getServerSideProps() {
  return { props: {} };
}

export default RecruiterPage;
