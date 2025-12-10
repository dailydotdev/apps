import { createContextProvider } from '@kickass-coderz/react';
import { useQuery } from '@tanstack/react-query';
import { useOpportunityPreview, opportunityByIdOptions } from '../queries';

const [OpportunityPreviewProvider, useOpportunityPreviewContext] =
  createContextProvider(() => {
    const { data } = useOpportunityPreview();
    const opportunityId = data?.result?.opportunityId;

    const { data: opportunity } = useQuery({
      ...opportunityByIdOptions({ id: opportunityId || '' }),
      enabled: !!opportunityId,
    });

    return { ...data, opportunity };
  });

export { OpportunityPreviewProvider, useOpportunityPreviewContext };
