import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  opportunityByIdOptions,
  getOpportunityMatchesOptions,
} from '@dailydotdev/shared/src/features/opportunity/queries';
import {
  recruiterAcceptOpportunityMatchMutationOptions,
  recruiterRejectOpportunityMatchMutationOptions,
} from '@dailydotdev/shared/src/features/opportunity/mutations';
import { RequestKey } from '@dailydotdev/shared/src/lib/query';
import type { OpportunityMatch } from '@dailydotdev/shared/src/features/opportunity/types';
import { OpportunityMatchStatus } from '@dailydotdev/shared/src/features/opportunity/types';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ProfilePicture,
  ProfileImageSize,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { VIcon, MiniCloseIcon } from '@dailydotdev/shared/src/components/icons';
import Alert, {
  AlertType,
} from '@dailydotdev/shared/src/components/widgets/Alert';
import { Accordion } from '@dailydotdev/shared/src/components/accordion';
import { getLayout } from '../../../components/layouts/RecruiterLayout';

type CandidateCardProps = {
  match: OpportunityMatch;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  localStatus?: OpportunityMatchStatus;
};

const CandidateCard = ({
  match,
  onApprove,
  onReject,
  localStatus,
}: CandidateCardProps): ReactElement => {
  const { user, candidatePreferences, screening, applicationRank } = match;
  const status = localStatus || match.status;

  // Calculate years of experience from role type (mock calculation)
  const yearsOfExperience = candidatePreferences?.roleType
    ? Math.floor(candidatePreferences.roleType * 10)
    : 0;

  const cvUrl = candidatePreferences?.cv?.fileName || '#';
  const profileUrl = `https://app.daily.dev/${user.username}`;

  return (
    <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6">
      <div className="flex flex-col gap-6">
        {/* Header with Profile Info */}
        <div className="flex items-start gap-4">
          <ProfilePicture
            user={user}
            size={ProfileImageSize.XXLarge}
            nativeLazyLoading
          />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-1">
              <Typography type={TypographyType.Title3} bold>
                {user.name}
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
              >
                @{user.username}
              </Typography>
            </div>
            {user.bio && (
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Tertiary}
              >
                {user.bio}
              </Typography>
            )}
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-2 gap-4 rounded-12 border border-border-subtlest-tertiary p-4 tablet:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Reputation
            </Typography>
            <Typography type={TypographyType.Title3} bold>
              {user.reputation?.toLocaleString() || 0}
            </Typography>
          </div>
          {yearsOfExperience > 0 && (
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Experience
              </Typography>
              <Typography type={TypographyType.Title3} bold>
                {yearsOfExperience}+ years
              </Typography>
            </div>
          )}
          {candidatePreferences?.role && (
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Role
              </Typography>
              <Typography type={TypographyType.Callout} bold>
                {candidatePreferences.role}
              </Typography>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          <Button
            tag="a"
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
          >
            View daily.dev Profile
          </Button>
          {user.linkedin && (
            <Button
              tag="a"
              href={`https://linkedin.com/in/${user.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
            >
              View LinkedIn Profile
            </Button>
          )}
          {cvUrl !== '#' && (
            <Button
              tag="a"
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
            >
              Download CV
            </Button>
          )}
        </div>

        {/* Application Rank */}
        {(applicationRank?.description || applicationRank?.warmIntro) && (
          <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-4">
            <Accordion
              title={
                <Typography type={TypographyType.Title3} bold>
                  Match Insights
                </Typography>
              }
            >
              <div className="flex flex-col gap-4">
                {applicationRank.description && (
                  <div>
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                      bold
                    >
                      Why this candidate?
                    </Typography>
                    <Typography
                      type={TypographyType.Body}
                      color={TypographyColor.Secondary}
                      className="mt-1"
                    >
                      {applicationRank.description}
                    </Typography>
                  </div>
                )}
                {applicationRank.warmIntro && (
                  <div>
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                      bold
                    >
                      Suggested intro
                    </Typography>
                    <Typography
                      type={TypographyType.Body}
                      color={TypographyColor.Secondary}
                      className="mt-1"
                    >
                      {applicationRank.warmIntro}
                    </Typography>
                  </div>
                )}
              </div>
            </Accordion>
          </div>
        )}

        {/* Screening Questions */}
        {screening && screening.length > 0 && (
          <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-4">
            <Accordion
              title={
                <Typography type={TypographyType.Title3} bold>
                  Screening Questions ({screening.length})
                </Typography>
              }
            >
              <div className="flex flex-col gap-4">
                {screening.map((qa) => (
                  <div
                    key={qa.screening}
                    className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-4"
                  >
                    <Typography type={TypographyType.Callout} bold>
                      {qa.screening}
                    </Typography>
                    <Typography
                      type={TypographyType.Body}
                      color={TypographyColor.Secondary}
                    >
                      {qa.answer}
                    </Typography>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
        )}

        {/* Action Buttons */}
        {status === 'candidate_accepted' && (
          <div className="flex gap-3">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              onClick={() => onApprove(user.id)}
              className="flex-1"
              icon={<VIcon />}
            >
              Approve Candidate
            </Button>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Medium}
              onClick={() => onReject(user.id)}
              className="flex-1"
              icon={<MiniCloseIcon />}
            >
              Reject
            </Button>
          </div>
        )}

        {status === 'recruiter_accepted' && (
          <Alert type={AlertType.Success} title="Candidate Approved" />
        )}

        {status === 'recruiter_rejected' && (
          <Alert type={AlertType.Error} title="Candidate Rejected" />
        )}
      </div>
    </div>
  );
};

const OpportunityDetailPage = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthReady } = useAuthContext();
  const queryClient = useQueryClient();

  // Track local status changes before mutation
  const [localStatusMap, setLocalStatusMap] = useState<
    Record<string, OpportunityMatchStatus>
  >({});

  // Fetch opportunity details
  const { data: opportunity, isLoading: isLoadingOpportunity } = useQuery(
    opportunityByIdOptions({ id: id as string }),
  );

  // Fetch opportunity matches
  const { data: matchesData, isLoading: isLoadingMatches } = useQuery(
    getOpportunityMatchesOptions({ opportunityId: id as string }),
  );

  const matches = matchesData?.edges.map((edge) => edge.node) || [];

  // Mutations
  const acceptMutation = useMutation({
    ...recruiterAcceptOpportunityMatchMutationOptions(),
    onSuccess: async () => {
      // Refetch matches after successful approval
      await queryClient.invalidateQueries({
        queryKey: [RequestKey.OpportunityMatches, id],
      });
    },
  });

  const rejectMutation = useMutation({
    ...recruiterRejectOpportunityMatchMutationOptions(),
    onSuccess: async () => {
      // Refetch matches after successful rejection
      await queryClient.invalidateQueries({
        queryKey: [RequestKey.OpportunityMatches, id],
      });
    },
  });

  const handleApprove = (userId: string) => {
    // Optimistic update
    setLocalStatusMap((prev) => ({
      ...prev,
      [userId]: OpportunityMatchStatus.RecruiterAccepted,
    }));

    // Call mutation
    acceptMutation.mutate({
      opportunityId: id as string,
      candidateUserId: userId,
    });
  };

  const handleReject = (userId: string) => {
    // Optimistic update
    setLocalStatusMap((prev) => ({
      ...prev,
      [userId]: OpportunityMatchStatus.RecruiterRejected,
    }));

    // Call mutation
    rejectMutation.mutate({
      opportunityId: id as string,
      candidateUserId: userId,
    });
  };

  const isLoading = isLoadingOpportunity || isLoadingMatches;

  if (!isAuthReady || isLoading) {
    return (
      <div className="relative mx-4 mt-10 max-w-[47.875rem] tablet:mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <Typography color={TypographyColor.Tertiary}>
            Loading opportunity details...
          </Typography>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!opportunity) {
    return (
      <div className="relative mx-4 mt-10 max-w-[47.875rem] tablet:mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Typography type={TypographyType.Title1} bold>
            Opportunity not found
          </Typography>
        </div>
      </div>
    );
  }

  // Filter candidates by status
  const pendingMatches = matches.filter(
    (m) => m.status === 'candidate_accepted',
  );
  const approvedMatches = matches.filter(
    (m) =>
      m.status === 'recruiter_accepted' ||
      localStatusMap[m.userId] === 'recruiter_accepted',
  );
  const rejectedMatches = matches.filter(
    (m) =>
      m.status === 'recruiter_rejected' ||
      localStatusMap[m.userId] === 'recruiter_rejected',
  );

  return (
    <div className="relative mx-4 mt-10 max-w-[64rem] tablet:mx-auto">
      <FlexCol className="gap-8 tablet:mx-4 laptop:mx-0">
        {/* Header */}
        <FlexCol className="gap-4">
          <button
            type="button"
            onClick={() => router.push('/recruiter/dashboard')}
            className="self-start"
          >
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Link}
            >
              ← Back to Dashboard
            </Typography>
          </button>

          <FlexCol className="gap-2">
            <Typography type={TypographyType.Title1} bold>
              {opportunity.title}
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
            >
              {opportunity.organization?.name} •{' '}
              {opportunity.location?.[0]?.city || 'Remote'}
            </Typography>
          </FlexCol>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4">
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Pending Review
              </Typography>
              <Typography type={TypographyType.Title2} bold>
                {pendingMatches.length}
              </Typography>
            </div>
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Approved
              </Typography>
              <Typography type={TypographyType.Title2} bold>
                {approvedMatches.length}
              </Typography>
            </div>
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Rejected
              </Typography>
              <Typography type={TypographyType.Title2} bold>
                {rejectedMatches.length}
              </Typography>
            </div>
          </div>
        </FlexCol>

        {/* Candidates List */}
        <FlexCol className="gap-4">
          <Typography type={TypographyType.Title2} bold>
            Candidate Applications
          </Typography>

          {matches.length > 0 ? (
            <FlexCol className="gap-4">
              {matches.map((match) => (
                <CandidateCard
                  key={match.userId}
                  match={match}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  localStatus={localStatusMap[match.userId]}
                />
              ))}
            </FlexCol>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-16 border border-border-subtlest-tertiary bg-surface-float py-12">
              <Typography color={TypographyColor.Tertiary}>
                No candidates yet
              </Typography>
            </div>
          )}
        </FlexCol>
      </FlexCol>
    </div>
  );
};

OpportunityDetailPage.getLayout = getLayout;

export default OpportunityDetailPage;
