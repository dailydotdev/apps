import type { ReactElement } from 'react';
import React from 'react';
import { RecruiterHeader } from '@dailydotdev/shared/src/components/recruiter/Header';
import { RecruiterProgress } from '@dailydotdev/shared/src/components/recruiter/Progress';
import { OpportunityEditProvider } from '@dailydotdev/shared/src/components/opportunity/OpportunityEditContext';
import { useRouter } from 'next/router';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';
import JobPage from '../jobs/[id]/index';

function PreparePage(): ReactElement {
  const router = useRouter();
  const opportunityId = (router?.query?.id as string) || 'mock-jobs-id';

  return (
    <div className="flex flex-1 flex-col">
      <RecruiterHeader
        headerButton={{
          text: 'Outreach settings',
        }}
      />
      <RecruiterProgress />
      <OpportunityEditProvider opportunityId={opportunityId}>
        <div className="flex-1 bg-background-subtle pt-6">
          <JobPage />
        </div>
      </OpportunityEditProvider>
    </div>
  );
}

const GetPageLayout: typeof getLayout = (page, layoutProps) => {
  const router = useRouter();
  const opportunityId = router?.query?.id as string;

  return (
    <OpportunityEditProvider opportunityId={opportunityId}>
      {getLayout(page, layoutProps)}
    </OpportunityEditProvider>
  );
};
PreparePage.getLayout = GetPageLayout;

export default PreparePage;
