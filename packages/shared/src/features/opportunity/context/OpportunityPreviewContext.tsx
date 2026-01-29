import { createContextProvider } from '@kickass-coderz/react';
import { useQuery } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useRouter } from 'next/router';
import {
  opportunityByIdOptions,
  opportunityPreviewQueryOptions,
} from '../queries';
import type { Opportunity, OpportunityPreviewResponse } from '../types';
import {
  opportunityPreviewRefetchIntervalMs,
  OpportunityPreviewStatus,
} from '../types';
import { OpportunityState } from '../protobuf/opportunity';
import { useAuthContext } from '../../../contexts/AuthContext';
import { oneMinute } from '../../../lib/dateFormat';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import type { ApiErrorResult } from '../../../graphql/common';
import { ApiError } from '../../../graphql/common';
import { getPathnameWithQuery } from '../../../lib';
import { webappUrl } from '../../../lib/constants';

export type OpportunityPreviewContextType = OpportunityPreviewResponse & {
  opportunity?: Opportunity;
  isParsing?: boolean;
};

type UseOpportunityPreviewProps = PropsWithChildren & {
  mockData?: OpportunityPreviewContextType;
};

const parseOpportunityIntervalMs = 3000;

const [OpportunityPreviewProvider, useOpportunityPreviewContext] =
  createContextProvider(({ mockData }: UseOpportunityPreviewProps = {}) => {
    const { user } = useAuthContext();
    const router = useRouter();
    const opportunityIdParam = router?.query?.opportunityId as
      | string
      | undefined;
    const anonEmail = router?.query?.email as string | undefined;

    const isValidOpportunityId =
      !!opportunityIdParam && opportunityIdParam !== 'new';

    // For public opportunities (anonymous access), use identifier instead of opportunityId
    const isAnonIdentifierFlow = !user && !!anonEmail;

    const [, updateOpportunity] = useUpdateQuery(
      opportunityByIdOptions({ id: opportunityIdParam || '' }),
    );

    // Fetch opportunity from URL param with polling for PARSING state
    const { data: opportunity } = useQuery({
      ...opportunityByIdOptions({ id: opportunityIdParam || '' }),
      enabled: isValidOpportunityId && !mockData,
      refetchInterval: (query) => {
        if (query.state.error) {
          const errorCode = (query.state.error as unknown as ApiErrorResult)
            .response?.errors?.[0]?.extensions?.code;

          if ([ApiError.Forbidden, ApiError.NotFound].includes(errorCode)) {
            router.push(
              getPathnameWithQuery(
                `${webappUrl}recruiter`,
                new URLSearchParams({
                  openModal: 'joblink',
                }),
              ),
            );

            return false;
          }
        }

        const retries = Math.max(
          query.state.dataUpdateCount,
          query.state.fetchFailureCount,
        );

        const state = query.state.data?.state;

        if (state !== OpportunityState.PARSING) {
          return false;
        }

        const maxRetries = (oneMinute * 1000) / parseOpportunityIntervalMs;

        if (retries > maxRetries) {
          updateOpportunity({
            ...query.state.data,
            state: OpportunityState.ERROR,
          });

          return false;
        }

        return parseOpportunityIntervalMs;
      },
    });

    const isParsing = opportunity?.state === OpportunityState.PARSING;
    const isParseError = opportunity?.state === OpportunityState.ERROR;

    const opportunityPreviewOptions = opportunityPreviewQueryOptions({
      opportunityId: isAnonIdentifierFlow ? undefined : opportunityIdParam,
      identifier: isAnonIdentifierFlow ? anonEmail : undefined,
      user: user || undefined,
    });

    const [, setOpportunityPreview] = useUpdateQuery({
      ...opportunityPreviewOptions,
      enabled: !mockData,
    });

    // Only fetch preview once opportunity is no longer in PARSING state
    // For public opportunities (anonymous), we can fetch immediately since we don't have opportunity data
    const { data } = useQuery({
      ...opportunityPreviewOptions,
      enabled:
        !mockData &&
        isValidOpportunityId &&
        !!opportunity &&
        !isParsing &&
        !isParseError,
      refetchInterval: (query) => {
        if (
          query.state.data?.result?.status === OpportunityPreviewStatus.ERROR
        ) {
          return false;
        }

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

    if (mockData) {
      return mockData;
    }

    return { ...data, opportunity, isParsing };
  });

export { OpportunityPreviewProvider, useOpportunityPreviewContext };
