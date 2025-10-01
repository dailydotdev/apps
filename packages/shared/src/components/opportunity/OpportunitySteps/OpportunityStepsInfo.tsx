import type { ReactElement } from 'react';
import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { recommendOpportunityScreeningQuestionsOptions } from '../../../features/opportunity/graphql';
import { opportunityByIdOptions } from '../../../features/opportunity/queries';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { opportunityEditStep1Schema } from '../../../lib/schema/opportunity';
import type { OpportunityStepsProps } from './OpportunitySteps';
import { OpportunitySteps } from './OpportunitySteps';
import { webappUrl } from '../../../lib/constants';
import type { ApiErrorResult } from '../../../graphql/common';
import { ApiError } from '../../../graphql/common';
import { labels } from '../../../lib/labels';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';

export const OpportunityStepsInfo = (
  props: Partial<OpportunityStepsProps>,
): ReactElement => {
  const router = useRouter();
  const opportunityId = router?.query?.id as string;
  const { displayToast } = useToastNotification();

  const [, updateOpportunity] = useUpdateQuery(
    opportunityByIdOptions({
      id: opportunityId,
    }),
  );

  const { data: opportunity } = useQuery(
    opportunityByIdOptions({ id: opportunityId }),
  );

  const goToNextStep = () => {
    router.push(`${webappUrl}opportunity/${opportunityId}/questions-setup`);
  };

  const { mutate: onSubmit, isPending } = useMutation({
    ...recommendOpportunityScreeningQuestionsOptions(),
    mutationFn: async ({ id }: { id: string }) => {
      if (opportunity?.questions?.length) {
        return opportunity.questions;
      }

      return await recommendOpportunityScreeningQuestionsOptions().mutationFn({
        id,
      });
    },
    onSuccess: (data) => {
      updateOpportunity({ ...opportunity, questions: data });

      goToNextStep();
    },
    onError: (error: ApiErrorResult) => {
      if (error.response?.errors?.[0]?.extensions?.code === ApiError.Conflict) {
        // questions already generated so we can just proceed
        goToNextStep();

        return;
      }

      displayToast(
        error.response?.errors?.[0]?.message || labels.error.generic,
      );
    },
  });

  return (
    <OpportunitySteps
      step={0}
      totalSteps={2}
      ctaText="Save & continue"
      schema={opportunityEditStep1Schema}
      ctaButtonProps={{
        loading: isPending,
        onClick: () => {
          onSubmit({ id: opportunityId });
        },
      }}
      {...props}
    />
  );
};
