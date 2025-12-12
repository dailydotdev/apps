import type { ReactElement } from 'react';
import React from 'react';
import { RecruiterHeader } from '@dailydotdev/shared/src/components/recruiter/Header';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '@dailydotdev/shared/src/components/recruiter/Progress';
import {
  OpportunityEditProvider,
  useOpportunityEditContext,
} from '@dailydotdev/shared/src/components/opportunity/OpportunityEditContext';
import { useRouter } from 'next/router';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getLayout } from '../../../components/layouts/RecruiterSelfServeLayout';
import JobPage from '../../jobs/[id]';

function PreparePage(): ReactElement {
  const router = useRouter();
  const { opportunityId } = useOpportunityEditContext();

  return (
    <div className="flex flex-1 flex-col">
      <RecruiterHeader
        headerButton={{
          text: 'Outreach settings',
          onClick: () => {
            router.push(`${webappUrl}recruiter/${opportunityId}/plans`);
          },
        }}
      />
      <RecruiterProgress activeStep={RecruiterProgressStep.PrepareAndLaunch} />
      <div className="flex-1 bg-background-subtle pt-6">
        <JobPage />
      </div>
    </div>
  );
}

const GetPageLayout: typeof getLayout = (page, layoutProps) => {
  const router = useRouter();
  const { opportunityId } = router.query;

  return (
    <OpportunityEditProvider opportunityId={opportunityId as string}>
      {getLayout(page, layoutProps)}
    </OpportunityEditProvider>
  );
};
PreparePage.getLayout = GetPageLayout;

export default PreparePage;
