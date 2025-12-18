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
import { opportunityEditStep1Schema } from '@dailydotdev/shared/src/lib/schema/opportunity';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { labels } from '@dailydotdev/shared/src/lib/labels';
import { getLayout } from '../../../components/layouts/RecruiterSelfServeLayout';
import JobPage from '../../jobs/[id]';

function PreparePage(): ReactElement {
  const router = useRouter();
  const { opportunityId, onValidateOpportunity } = useOpportunityEditContext();
  const { showPrompt } = usePrompt();

  return (
    <div className="flex flex-1 flex-col">
      <RecruiterHeader
        headerButton={{
          text: 'Outreach settings',
          onClick: async () => {
            const result = onValidateOpportunity({
              schema: opportunityEditStep1Schema,
            });

            if (result.error) {
              await showPrompt({
                title: labels.opportunity.requiredMissingNotice.title,
                description: (
                  <div className="flex flex-col gap-4">
                    <span>
                      {labels.opportunity.requiredMissingNotice.description}
                    </span>
                    <ul className="text-text-tertiary">
                      {result.error.issues.map((issue) => {
                        const path = issue.path.join('.');

                        return <li key={path}>• {path}</li>;
                      })}
                    </ul>
                  </div>
                ),
                okButton: {
                  className: '!w-full',
                  title: labels.opportunity.requiredMissingNotice.okButton,
                },
                cancelButton: null,
              });

              return;
            }

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
