import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ConnectHeader } from '@dailydotdev/shared/src/components/recruiter/ConnectHeader';
import { ConnectProgress } from '@dailydotdev/shared/src/components/recruiter/ConnectProgress';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import {
  recruiterAcceptOpportunityMatchMutationOptions,
  recruiterRejectOpportunityMatchMutationOptions,
} from '@dailydotdev/shared/src/features/opportunity/mutations';
import { MatchCard } from '@dailydotdev/shared/src/features/opportunity/components/MatchCard';
import { useOpportunityMatches } from '@dailydotdev/shared/src/features/opportunity/hooks/useOpportunityMatches';
import { OpportunityProvider } from '@dailydotdev/shared/src/features/opportunity/context/OpportunityContext';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { GenericLoaderSpinner } from '@dailydotdev/shared/src/components/utilities/loaders';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { oneMinute } from '@dailydotdev/shared/src/lib/dateFormat';
import { transactionRefetchIntervalMs } from '@dailydotdev/shared/src/graphql/njord';
import { OpportunityState } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import { getLayout } from '../../../../components/layouts/RecruiterSelfServeLayout';

function RecruiterMatchesPage(): ReactElement {
  const router = useRouter();
  const { opportunityId } = router.query;
  const queryClient = useQueryClient();

  const { data: opportunity } = useQuery({
    ...opportunityByIdOptions({
      id: opportunityId as string,
    }),
    refetchInterval: (query) => {
      const retries = Math.max(
        query.state.dataUpdateCount,
        query.state.fetchFailureCount,
      );

      const maxRetries = (oneMinute * 1000) / transactionRefetchIntervalMs;

      if (retries > maxRetries) {
        return false;
      }

      const queryError = query.state.error;

      // in case of query error keep refetching until maxRetries is reached
      if (queryError) {
        return transactionRefetchIntervalMs;
      }

      const isReadyForMatches =
        query.state.data?.state !== OpportunityState.DRAFT;

      if (isReadyForMatches) {
        return false;
      }

      return transactionRefetchIntervalMs;
    },
  });

  const { allMatches, isLoading, data } = useOpportunityMatches({
    opportunityId: opportunityId as string,
    status: 'candidate_accepted',
    first: 1,
  });

  const currentMatchIndex = allMatches.length - 1;
  const currentMatch = allMatches[currentMatchIndex];
  const totalMatches = data?.pages[0]?.pageInfo?.totalCount ?? 0;

  // Mutations
  const acceptMutation = useMutation({
    ...recruiterAcceptOpportunityMatchMutationOptions(),
    onSuccess: async () => {
      // Refetch matches after successful approval
      await queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.OpportunityMatches, null, {
          opportunityId,
        }),
      });
    },
  });

  const rejectMutation = useMutation({
    ...recruiterRejectOpportunityMatchMutationOptions(),
    onSuccess: async () => {
      // Refetch matches after successful rejection
      await queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.OpportunityMatches, null, {
          opportunityId,
        }),
      });
    },
  });

  const handleReject = () => {
    rejectMutation.mutate({
      opportunityId: opportunityId as string,
      candidateUserId: currentMatch.userId,
    });
  };

  const handleApprove = () => {
    acceptMutation.mutate({
      opportunityId: opportunityId as string,
      candidateUserId: currentMatch.userId,
    });
  };

  if (isLoading) {
    return (
      <OpportunityProvider opportunityId={opportunityId as string}>
        <div className="flex flex-1 flex-col">
          <ConnectHeader activeTab="review" />
          <ConnectProgress />
          <div className="flex flex-1 items-center justify-center bg-background-subtle">
            <Loader />
          </div>
        </div>
      </OpportunityProvider>
    );
  }

  const isReadyForMatches = opportunity?.state !== OpportunityState.DRAFT;

  return (
    <OpportunityProvider opportunityId={opportunityId as string}>
      <div className="flex flex-1 flex-col">
        <ConnectHeader activeTab="review" />
        <ConnectProgress />
        <div
          className={classNames(
            'flex flex-1 flex-col bg-background-subtle',
            currentMatch ? 'p-6' : '',
          )}
        >
          {currentMatch ? (
            <MatchCard
              match={currentMatch}
              currentMatch={currentMatchIndex + 1}
              totalMatches={totalMatches}
              onReject={handleReject}
              onApprove={handleApprove}
              disabled={
                isLoading ||
                acceptMutation.isPending ||
                rejectMutation.isPending
              }
            />
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 border-b border-border-subtlest-tertiary bg-brand-float px-4 py-3">
                <GenericLoaderSpinner size={IconSize.XSmall} />
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Brand}
                >
                  Promising candidates will appear here for your review.
                </Typography>
              </div>
              <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-6">
                <Typography type={TypographyType.Mega3} bold center>
                  We are reaching out to devs and we&#39;ll find who&#39;s ready
                  to say yes.
                </Typography>
                <Typography
                  type={TypographyType.Body}
                  color={TypographyColor.Tertiary}
                  center
                >
                  {isReadyForMatches &&
                    "We're already talking to the right developers for you — all opt-in, all high-intent."}
                  {!isReadyForMatches &&
                    'We are gonna start reaching to developers soon, we are still processing your data and payment...'}
                </Typography>
              </div>
            </>
          )}
        </div>
      </div>
    </OpportunityProvider>
  );
}

RecruiterMatchesPage.getLayout = getLayout;

export default RecruiterMatchesPage;
