import { createContextProvider } from '@kickass-coderz/react';
import { useQuery } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useRouter } from 'next/router';
import {
  opportunityByIdOptions,
  opportunityPreviewQueryOptions,
} from '../queries';
import type { Opportunity, OpportunityPreviewConnection } from '../types';
import {
  opportunityPreviewRefetchIntervalMs,
  OpportunityPreviewStatus,
} from '../types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { oneMinute } from '../../../lib/dateFormat';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';

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

    const [, setOpportunityPreview] = useUpdateQuery(
      opportunityPreviewQueryOptions({
        opportunityId: opportunityIdParam,
        user: user || undefined,
        enabled: !mockData,
      }),
    );

    const { data } = useQuery({
      ...opportunityPreviewQueryOptions({
        opportunityId: opportunityIdParam,
        user: user || undefined,
        enabled: !mockData,
      }),
      refetchInterval: (query) => {
        const retries = Math.max(
          query.state.dataUpdateCount,
          query.state.fetchFailureCount,
        );

        // preview generation takes time so we stop retrying after 2 minutes
        const maxRetries =
          (2 * oneMinute * 1000) / opportunityPreviewRefetchIntervalMs;

        if (retries > maxRetries) {
          // set to error on retries exceeded and show message
          setOpportunityPreview({
            ...query.state.data,
            result: {
              ...query.state.data?.result,
              status: OpportunityPreviewStatus.ERROR,
            },
          });

          return false;
        }

        const queryError = query.state.error;

        // in case of query error keep refetching until maxRetries is reached
        if (queryError) {
          return opportunityPreviewRefetchIntervalMs;
        }

        const isReady =
          query.state.data?.result?.status === OpportunityPreviewStatus.READY;

        if (isReady) {
          return false;
        }

        return opportunityPreviewRefetchIntervalMs;
      },
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
