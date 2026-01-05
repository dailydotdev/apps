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
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useUpdateQuery } from '@dailydotdev/shared/src/hooks/useUpdateQuery';
import { recommendOpportunityScreeningQuestionsOptions } from '@dailydotdev/shared/src/features/opportunity/mutations';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ToastSubject,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks/useToastNotification';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import JobPage from '../../jobs/[id]';
import { getLayout } from '../../../components/layouts/RecruiterSelfServeLayout';

function PreparePage(): ReactElement {
  const router = useRouter();
  const { opportunityId, onValidateOpportunity } = useOpportunityEditContext();
  const { showPrompt } = usePrompt();
  const { dismissToast, displayToast, subject } = useToastNotification();

  const { data: opportunity } = useQuery(
    opportunityByIdOptions({ id: opportunityId }),
  );

  const [, updateOpportunity] = useUpdateQuery(
    opportunityByIdOptions({
      id: opportunityId,
    }),
  );

  const goToNextStep = async () => {
    await router.push(`${webappUrl}recruiter/${opportunityId}/questions`);
  };

  const {
    mutate: onSubmit,
    isPending,
    isSuccess,
  } = useMutation({
    ...recommendOpportunityScreeningQuestionsOptions(),
    mutationFn: async ({ id }: { id: string }) => {
      if (opportunity?.questions?.length) {
        return opportunity.questions;
      }

      displayToast(
        'Just a momment, generating screening questions for your job....',
        {
          subject: ToastSubject.OpportunityScreeningQuestions,
          timer: 10_000,
        },
      );

      return await recommendOpportunityScreeningQuestionsOptions().mutationFn({
        id,
      });
    },
    onSuccess: async (data) => {
      updateOpportunity({ ...opportunity, questions: data });

      await goToNextStep();
    },
    onError: async (error: ApiErrorResult) => {
      if (error.response?.errors?.[0]?.extensions?.code !== ApiError.Conflict) {
        displayToast(
          'We could not generate questions but you can add some manually. Sorry for that!',
          {
            subject: null,
          },
        );
      }

      await goToNextStep();
    },
    onSettled: () => {
      if (subject === ToastSubject.OpportunityScreeningQuestions) {
        dismissToast();
      }
    },
  });

  return (
    <div className="flex flex-1 flex-col">
      <RecruiterHeader
        headerButton={{
          text: 'Outreach questions',
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
                      {result.error.issues.map((issue) => (
                        <li key={issue.message}>• {issue.message}</li>
                      ))}
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

            onSubmit({
              id: opportunity.id,
            });
          },
          loading: isPending || isSuccess,
        }}
      />
      <RecruiterProgress activeStep={RecruiterProgressStep.PrepareAndLaunch} />
      <div className="flex-1 bg-background-subtle pt-6">
        <JobPage
          hideHeader
          hideCompanyBadge
          hideRecruiterBadge
          hideCompanyPanel
          hideRecruiterPanel
        />
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
