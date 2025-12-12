import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { getLayout } from '../../../../components/layouts/RecruiterSelfServeLayout';

function RecruiterMatchesPage(): ReactElement {
  const router = useRouter();
  const { opportunityId } = router.query;
  const queryClient = useQueryClient();

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
          <div className="flex flex-1 items-center justify-center">
            <Loader />
          </div>
        </div>
      </OpportunityProvider>
    );
  }

  if (!currentMatch) {
    return (
      <OpportunityProvider opportunityId={opportunityId as string}>
        <div className="flex flex-1 flex-col">
          <ConnectHeader activeTab="review" />
          <ConnectProgress />
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-text-tertiary">No matches found</p>
          </div>
        </div>
      </OpportunityProvider>
    );
  }

  return (
    <OpportunityProvider opportunityId={opportunityId as string}>
      <div className="flex flex-1 flex-col">
        <ConnectHeader activeTab="review" />
        <ConnectProgress />
        <div className="flex flex-1 flex-col bg-background-subtle p-6">
          <MatchCard
            match={currentMatch}
            currentMatch={currentMatchIndex + 1}
            totalMatches={totalMatches}
            onReject={handleReject}
            onApprove={handleApprove}
            disabled={
              isLoading || acceptMutation.isPending || rejectMutation.isPending
            }
          />
        </div>
      </div>
    </OpportunityProvider>
  );
}

RecruiterMatchesPage.getLayout = getLayout;

export default RecruiterMatchesPage;
