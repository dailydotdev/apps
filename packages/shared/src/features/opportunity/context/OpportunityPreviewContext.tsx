import { createContextProvider } from '@kickass-coderz/react';
import { useQuery } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useRouter } from 'next/router';
import {
  opportunityByIdOptions,
  opportunityPreviewQueryOptions,
} from '../queries';
import type { Opportunity, OpportunityPreviewConnection } from '../types';
import { useAuthContext } from '../../../contexts/AuthContext';

export type OpportunityPreviewContextType = OpportunityPreviewConnection & {
  opportunity?: Opportunity;
};

type UseOpportunityPreviewProps = PropsWithChildren & {
  mockData?: OpportunityPreviewContextType;
};

const [OpportunityPreviewProvider, useOpportunityPreviewContext] =
  createContextProvider(({ mockData }: UseOpportunityPreviewProps = {}) => {
    const { user } = useAuthContext();
    const router = useRouter();
    const opportunityIdParam = router?.query?.opportunityId as
      | string
      | undefined;

    const { data } = useQuery(
      opportunityPreviewQueryOptions({
        opportunityId: opportunityIdParam,
        user: user || undefined,
        enabled: !mockData,
      }),
    );

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
