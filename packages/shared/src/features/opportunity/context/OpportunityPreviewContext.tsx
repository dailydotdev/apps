import { createContextProvider } from '@kickass-coderz/react';
import { useQuery } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { getOpportunityPreview, opportunityByIdOptions } from '../queries';
import type { Opportunity, OpportunityPreviewConnection } from '../types';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { disabledRefetch } from '../../../lib/func';

export type OpportunityPreviewContextType = OpportunityPreviewConnection & {
  opportunity?: Opportunity;
};

type UseOpportunityPreviewProps = PropsWithChildren & {
  mockData?: OpportunityPreviewContextType;
};

const [OpportunityPreviewProvider, useOpportunityPreviewContext] =
  createContextProvider(({ mockData }: UseOpportunityPreviewProps = {}) => {
    const { user } = useAuthContext();

    const { data } = useQuery({
      queryKey: generateQueryKey(RequestKey.OpportunityPreview, user),
      queryFn: () => getOpportunityPreview(),
      enabled: !!user && !mockData,
      ...disabledRefetch,
      staleTime: Infinity,
      gcTime: Infinity,
    });

    const opportunityId = data?.result?.opportunityId;

    const { data: opportunity } = useQuery({
      ...opportunityByIdOptions({ id: opportunityId || '' }),
      enabled: !!opportunityId && !mockData,
    });

    if (mockData) {
      return mockData;
    }

    return { ...data, opportunity };
  });

export { OpportunityPreviewProvider, useOpportunityPreviewContext };
