import type { ReactElement } from 'react';
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type { OpportunityStepsProps } from './OpportunitySteps';
import { OpportunitySteps } from './OpportunitySteps';
import { webappUrl } from '../../../lib/constants';
import type { ApiErrorResult } from '../../../graphql/common';
import { labels } from '../../../lib/labels';
import { updateOpportunityStateOptions } from '../../../features/opportunity/mutations';
import { opportunityEditStep2Schema } from '../../../lib/schema/opportunity';
import { OpportunityState } from '../../../features/opportunity/protobuf/opportunity';

export const OpportunityStepsQuestions = (
  props: Partial<OpportunityStepsProps>,
): ReactElement => {
  const router = useRouter();
  const opportunityId = router?.query?.id as string;
  const { displayToast } = useToastNotification();

  const goToNextStep = () => {
    router.push(`${webappUrl}opportunity/${opportunityId}/approved`);
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
    onError: (error: ApiErrorResult) => {
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
        onClick: () => {
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
