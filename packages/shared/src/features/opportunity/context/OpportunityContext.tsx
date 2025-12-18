import { createContextProvider } from '@kickass-coderz/react';
import { useQuery } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { opportunityByIdOptions } from '../queries';

type UseOpportunityProps = PropsWithChildren & {
  opportunityId: string;
};

const [OpportunityProvider, useOpportunityContext] = createContextProvider(
  ({ opportunityId }: UseOpportunityProps) => {
    const { data: opportunity, isLoading } = useQuery({
      ...opportunityByIdOptions({ id: opportunityId }),
      enabled: !!opportunityId,
    });

    return { opportunity, isLoading };
  },
);

export { OpportunityProvider, useOpportunityContext };
