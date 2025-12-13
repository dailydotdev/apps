import type { ReactElement } from 'react';
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type { OpportunityStepsProps } from './OpportunitySteps';
import { OpportunitySteps } from './OpportunitySteps';
import { webappUrl } from '../../../lib/constants';
import type {
  ApiResponseError,
  ApiZodErrorExtension,
  ApiErrorResult,
} from '../../../graphql/common';
import { ApiError } from '../../../graphql/common';
import { labels } from '../../../lib/labels';
import { updateOpportunityStateOptions } from '../../../features/opportunity/mutations';
import { opportunityEditStep2Schema } from '../../../lib/schema/opportunity';
import { OpportunityState } from '../../../features/opportunity/protobuf/opportunity';
import type { PromptOptions } from '../../../hooks/usePrompt';
import { usePrompt } from '../../../hooks/usePrompt';

export const opportunityEditDiscardPrompt: PromptOptions = {
  title: labels.opportunity.approveNotice.title,
  description: labels.opportunity.approveNotice.description,
  okButton: {
    title: labels.opportunity.approveNotice.okButton,
  },
  cancelButton: {
    title: labels.opportunity.approveNotice.cancelButton,
  },
};

export const OpportunityStepsQuestions = (
  props: Partial<OpportunityStepsProps>,
): ReactElement => {
  const { showPrompt } = usePrompt();
  const router = useRouter();
  const opportunityId = router?.query?.id as string;
  const { displayToast } = useToastNotification();

  const goToNextStep = () => {
    router.push(`${webappUrl}jobs/${opportunityId}/approved`);
  };

  const {
    mutate: onSubmit,
    isPending,
    isSuccess,
  } = useMutation({
    ...updateOpportunityStateOptions(),
    onSuccess: () => {
      goToNextStep();
    },
    onError: async (error: ApiErrorResult) => {
      if (
        error.response?.errors?.[0]?.extensions?.code ===
        ApiError.ZodValidationError
      ) {
        const apiError = error.response
          .errors[0] as ApiResponseError<ApiZodErrorExtension>;

        await showPrompt({
          title: labels.opportunity.requiredMissingNotice.title,
          description: (
            <div className="flex flex-col gap-4">
              <span>
                {labels.opportunity.requiredMissingNotice.description}
              </span>
              <ul className="text-text-tertiary">
                {apiError.extensions.issues.map((issue) => {
                  const path = issue.path.join('.');

                  return <li key={path}>• {path}</li>;
                })}
              </ul>
            </div>
          ),
          cancelButton: null,
        });

        return;
      }

      displayToast(
        error.response?.errors?.[0]?.message || labels.error.generic,
      );
    },
  });

  return (
    <OpportunitySteps
      step={1}
      totalSteps={2}
      ctaText="Approve & publish"
      schema={opportunityEditStep2Schema}
      ctaButtonProps={{
        loading: isPending || isSuccess,
        onClick: async () => {
          const result = await showPrompt(opportunityEditDiscardPrompt);

          if (!result) {
            return;
          }

          onSubmit({
            id: opportunityId,
            state: OpportunityState.LIVE,
          });
        },
      }}
      {...props}
    />
  );
};
