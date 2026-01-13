import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ConnectHeader } from '@dailydotdev/shared/src/components/recruiter/ConnectHeader';
import { ConnectProgress } from '@dailydotdev/shared/src/components/recruiter/ConnectProgress';
import { RecruiterSetupChecklist } from '@dailydotdev/shared/src/components/recruiter/RecruiterSetupChecklist';
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
import { AgentStatusBar } from '@dailydotdev/shared/src/features/recruiter/components/AgentStatusBar';

import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { oneMinute } from '@dailydotdev/shared/src/lib/dateFormat';
import { transactionRefetchIntervalMs } from '@dailydotdev/shared/src/graphql/njord';
import { OpportunityState } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import { useRequirePayment } from '@dailydotdev/shared/src/features/opportunity/hooks/useRequirePayment';
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

  const { isCheckingPayment } = useRequirePayment({
    opportunity,
    opportunityId: opportunityId as string,
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

  if (isLoading || isCheckingPayment) {
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
  const isInReview = opportunity?.state === OpportunityState.IN_REVIEW;

  const getStaticMessage = (): string | undefined => {
    if (isInReview) {
      return 'Your job is in review. We will notify you once it goes live.';
    }
    if (!isReadyForMatches) {
      return 'Processing your data and payment...';
    }
    return undefined;
  };

  return (
    <OpportunityProvider opportunityId={opportunityId as string}>
      <div className="flex flex-1 flex-col">
        <ConnectHeader activeTab="review" />
        <ConnectProgress />
        <AgentStatusBar
          staticMessage={getStaticMessage()}
          opportunity={opportunity}
          opportunityId={opportunityId as string}
        />
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
            <div className="mx-auto flex flex-1 flex-col items-center justify-center gap-6 p-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <Typography type={TypographyType.Title1} bold>
                  While we find your matches...
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  Complete these steps to maximize your response rates
                </Typography>
              </div>
              <RecruiterSetupChecklist opportunity={opportunity} />
            </div>
          )}
        </div>
      </div>
    </OpportunityProvider>
  );
}

RecruiterMatchesPage.getLayout = getLayout;

export default RecruiterMatchesPage;
