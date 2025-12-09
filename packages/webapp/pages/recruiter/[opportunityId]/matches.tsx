import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { ConnectHeader } from '@dailydotdev/shared/src/components/recruiter/ConnectHeader';
import { ConnectProgress } from '@dailydotdev/shared/src/components/recruiter/ConnectProgress';
import { ScreeningQuestions } from '@dailydotdev/shared/src/components/recruiter/ScreeningQuestions';
import type { EngagementProfileData } from '@dailydotdev/shared/src/components/recruiter/EngagementProfile';
import { EngagementProfile } from '@dailydotdev/shared/src/components/recruiter/EngagementProfile';
import { MatchReviewHeader } from '@dailydotdev/shared/src/components/recruiter/MatchReviewHeader';
import type { MatchProfileDetails } from '@dailydotdev/shared/src/components/recruiter/MatchProfile';
import { MatchProfile } from '@dailydotdev/shared/src/components/recruiter/MatchProfile';
import { MatchInsights } from '@dailydotdev/shared/src/components/recruiter/MatchInsights';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { useRequestProtocol } from '@dailydotdev/shared/src/hooks/useRequestProtocol';
import type {
  OpportunityMatch,
  OpportunityMatchesData,
} from '@dailydotdev/shared/src/graphql/opportunities';
import { OPPORTUNITY_MATCHES_QUERY } from '@dailydotdev/shared/src/graphql/opportunities';
import {
  recruiterAcceptOpportunityMatchMutationOptions,
  recruiterRejectOpportunityMatchMutationOptions,
} from '@dailydotdev/shared/src/features/opportunity/mutations';
import { getLayout } from '../../../components/layouts/RecruiterSelfServeLayout';

const mapMatchToProfile = (match: OpportunityMatch): MatchProfileDetails => {
  return {
    name: match.user.name,
    profileImage: match.user.image,
    profileLink: match.user.permalink,
    reputation: match.user.reputation,
    seniority: match.previewUser?.seniority || 'Not specified',
    location: match.previewUser?.location || 'Not specified',
    openToWork: match.previewUser?.openToWork ?? true,
    company: match.previewUser?.company || { name: 'Not specified' },
    lastActivity: match.previewUser?.lastActivity,
  };
};

const mapMatchToEngagement = (
  match: OpportunityMatch,
): EngagementProfileData => {
  return {
    topTags: match.previewUser?.topTags ?? [],
    recentlyRead: match.previewUser?.recentlyRead ?? [],
    activeSquads: match.previewUser?.activeSquads ?? [],
    profileSummary: match.engagementProfile?.profileText || '',
  };
};

function RecruiterMatchesPage(): ReactElement {
  const router = useRouter();
  const { opportunityId } = router.query;
  const { requestMethod } = useRequestProtocol();
  const queryClient = useQueryClient();

  const { data, isLoading } = useInfiniteQuery({
    queryKey: generateQueryKey(RequestKey.OpportunityMatches, null, {
      opportunityId,
    }),
    queryFn: async ({ pageParam }) => {
      const result = await requestMethod<OpportunityMatchesData>(
        OPPORTUNITY_MATCHES_QUERY,
        {
          opportunityId,
          status: 'candidate_accepted',
          first: 1,
          after: pageParam,
        },
      );
      return result.opportunityMatches;
    },
    initialPageParam: '',
    enabled: !!opportunityId,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage?.pageInfo),
    staleTime: StaleTime.Default,
  });

  const allMatches =
    data?.pages.flatMap((page) => page.edges.map((edge) => edge.node)) || [];
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
      <div className="flex flex-1 flex-col">
        <ConnectHeader />
        <ConnectProgress />
        <div className="flex flex-1 items-center justify-center">
          <Loader />
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="flex flex-1 flex-col">
        <ConnectHeader />
        <ConnectProgress />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-text-tertiary">No matches found</p>
        </div>
      </div>
    );
  }

  const profile = mapMatchToProfile(currentMatch);
  const engagement = mapMatchToEngagement(currentMatch);
  const screeningQuestions = currentMatch.screening.map((s) => ({
    question: s.screening,
    answer: s.answer,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <ConnectHeader />
      <ConnectProgress />
      <div className="flex flex-1 flex-col bg-background-subtle p-6">
        <div className="flex max-w-full flex-shrink flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-invert">
          <MatchReviewHeader
            currentMatch={currentMatchIndex + 1}
            totalMatches={totalMatches}
            name={profile.name}
            onReject={handleReject}
            onApprove={handleApprove}
            disabled={
              isLoading || acceptMutation.isPending || rejectMutation.isPending
            }
          />
          <div className="flex gap-8 p-6">
            <div className="flex flex-1 flex-col gap-6">
              <MatchProfile profile={profile} />
              <MatchInsights applicationRank={currentMatch.applicationRank} />
            </div>
            <div className="flex flex-1 flex-col gap-6">
              <ScreeningQuestions questions={screeningQuestions} />
            </div>
          </div>
          <EngagementProfile engagement={engagement} />
        </div>
      </div>
    </div>
  );
}

RecruiterMatchesPage.getLayout = getLayout;

export default RecruiterMatchesPage;
