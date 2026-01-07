import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { updateOpportunityStateOptions } from '@dailydotdev/shared/src/features/opportunity/mutations';
import { OpportunityState } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
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
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  ProfilePicture,
  ProfileImageSize,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { VIcon, ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { getLayout } from '../../../components/layouts/RecruiterLayout';

const STATE_LABELS: Record<OpportunityState, string> = {
  [OpportunityState.DRAFT]: 'Draft',
  [OpportunityState.IN_REVIEW]: 'In Review',
  [OpportunityState.LIVE]: 'Live',
  [OpportunityState.CLOSED]: 'Closed',
  [OpportunityState.UNSPECIFIED]: 'Unknown',
};

const STATE_COLORS: Record<OpportunityState, string> = {
  [OpportunityState.DRAFT]: 'bg-surface-float text-text-tertiary',
  [OpportunityState.IN_REVIEW]: 'bg-status-warning text-white',
  [OpportunityState.LIVE]: 'bg-accent-cabbage-default text-white',
  [OpportunityState.CLOSED]: 'bg-surface-float text-text-tertiary',
  [OpportunityState.UNSPECIFIED]: 'bg-surface-float text-text-tertiary',
};

type ContentSectionProps = {
  title: string;
  html?: string;
};

const ContentSection = ({
  title,
  html,
}: ContentSectionProps): ReactElement | null => {
  if (!html) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <Typography type={TypographyType.Body} bold>
        {title}
      </Typography>
      <div
        className="prose prose-invert max-w-none text-text-secondary typo-callout"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

const ReviewDetailPage = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthReady } = useAuthContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  const { data: opportunity, isLoading } = useQuery(
    opportunityByIdOptions({ id: id as string }),
  );

  const { mutate: updateState, isPending } = useMutation({
    ...updateOpportunityStateOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: opportunityByIdOptions({ id: id as string }).queryKey,
      });
      displayToast('Job status updated');
    },
    onError: () => {
      displayToast('Failed to update job status');
    },
  });

  const handleApprove = () => {
    updateState({
      id: id as string,
      state: OpportunityState.LIVE,
    });
  };

  if (!isAuthReady || isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Only team members can access this page
  if (!user?.isTeamMember) {
    router.replace('/');
    return null;
  }

  if (!opportunity) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Typography type={TypographyType.Title1} bold>
          Job not found
        </Typography>
        <Button
          tag="a"
          href={`${webappUrl}recruiter/review`}
          variant={ButtonVariant.Secondary}
        >
          Back to review queue
        </Button>
      </div>
    );
  }

  const recruiter = opportunity.recruiters?.[0];
  const location = opportunity.locations?.[0];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href={`${webappUrl}recruiter/review`}>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="rotate-180" />}
          >
            Back to queue
          </Button>
        </Link>
      </div>

      {/* Status Banner */}
      <div className="flex items-center justify-between rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-8 px-3 py-1 font-bold typo-callout ${
              STATE_COLORS[opportunity.state]
            }`}
          >
            {STATE_LABELS[opportunity.state]}
          </span>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            ID: {opportunity.id}
          </Typography>
        </div>
        {opportunity.state === OpportunityState.IN_REVIEW && (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<VIcon />}
            onClick={handleApprove}
            disabled={isPending}
          >
            Approve & Go Live
          </Button>
        )}
      </div>

      {/* Company & Recruiter Info */}
      <div className="grid gap-4 tablet:grid-cols-2">
        {/* Company */}
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Company
          </Typography>
          <div className="flex items-center gap-3">
            {opportunity.organization?.image && (
              <img
                src={opportunity.organization.image}
                alt={opportunity.organization.name}
                className="h-12 w-12 rounded-12 object-cover"
              />
            )}
            <div className="flex flex-col">
              <Typography type={TypographyType.Body} bold>
                {opportunity.organization?.name || 'No company'}
              </Typography>
              {opportunity.organization?.website && (
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Link}
                  href={opportunity.organization.website}
                  target="_blank"
                  rel={anchorDefaultRel}
                >
                  {opportunity.organization.website}
                </Typography>
              )}
            </div>
          </div>
        </div>

        {/* Recruiter */}
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Recruiter
          </Typography>
          {recruiter ? (
            <div className="flex items-center gap-3">
              <ProfilePicture user={recruiter} size={ProfileImageSize.Large} />
              <div className="flex flex-col">
                <Typography type={TypographyType.Body} bold>
                  {recruiter.name}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {recruiter.title}
                </Typography>
              </div>
            </div>
          ) : (
            <Typography color={TypographyColor.Tertiary}>
              No recruiter assigned
            </Typography>
          )}
        </div>
      </div>

      {/* Job Details */}
      <FlexCol className="gap-4 rounded-16 border border-border-subtlest-tertiary p-6">
        <div className="flex flex-col gap-1">
          <Typography type={TypographyType.LargeTitle} bold>
            {opportunity.title}
          </Typography>
          {location && (
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
            >
              {location.location?.city}
              {location.location?.country && `, ${location.location.country}`}
              {location.type && ` (${location.type})`}
            </Typography>
          )}
        </div>

        {/* TLDR */}
        {opportunity.tldr && (
          <div className="rounded-12 bg-surface-float p-4">
            <Typography type={TypographyType.Callout}>
              {opportunity.tldr}
            </Typography>
          </div>
        )}

        {/* Keywords */}
        {opportunity.keywords && opportunity.keywords.length > 0 && (
          <div className="flex flex-col gap-2">
            <Typography type={TypographyType.Body} bold>
              Tech Stack / Keywords
            </Typography>
            <div className="flex flex-wrap gap-2">
              {opportunity.keywords.map((kw) => (
                <span
                  key={kw.keyword}
                  className="rounded-8 bg-surface-float px-2 py-1 typo-footnote"
                >
                  {kw.keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta Info */}
        <div className="grid gap-4 rounded-12 bg-surface-float p-4 tablet:grid-cols-4">
          {opportunity.meta?.employmentType && (
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Employment Type
              </Typography>
              <Typography type={TypographyType.Callout} bold>
                {opportunity.meta.employmentType === 1 && 'Full-time'}
                {opportunity.meta.employmentType === 2 && 'Part-time'}
                {opportunity.meta.employmentType === 3 && 'Contract'}
              </Typography>
            </div>
          )}
          {opportunity.meta?.seniorityLevel && (
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Seniority
              </Typography>
              <Typography type={TypographyType.Callout} bold>
                Level {opportunity.meta.seniorityLevel}
              </Typography>
            </div>
          )}
          {opportunity.meta?.teamSize && (
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Team Size
              </Typography>
              <Typography type={TypographyType.Callout} bold>
                {opportunity.meta.teamSize}
              </Typography>
            </div>
          )}
          {opportunity.meta?.salary && (
            <div className="flex flex-col gap-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Salary Range
              </Typography>
              <Typography type={TypographyType.Callout} bold>
                ${opportunity.meta.salary.min?.toLocaleString()} - $
                {opportunity.meta.salary.max?.toLocaleString()}
              </Typography>
            </div>
          )}
        </div>
      </FlexCol>

      {/* Content Sections */}
      <FlexCol className="gap-6 rounded-16 border border-border-subtlest-tertiary p-6">
        <Typography type={TypographyType.Title2} bold>
          Job Description Content
        </Typography>
        <ContentSection
          title="Overview"
          html={opportunity.content?.overview?.html}
        />
        <ContentSection
          title="Responsibilities"
          html={opportunity.content?.responsibilities?.html}
        />
        <ContentSection
          title="Requirements"
          html={opportunity.content?.requirements?.html}
        />
        <ContentSection
          title="What You'll Do"
          html={opportunity.content?.whatYoullDo?.html}
        />
        <ContentSection
          title="Interview Process"
          html={opportunity.content?.interviewProcess?.html}
        />
      </FlexCol>

      {/* Screening Questions */}
      {opportunity.questions && opportunity.questions.length > 0 && (
        <FlexCol className="gap-4 rounded-16 border border-border-subtlest-tertiary p-6">
          <Typography type={TypographyType.Title2} bold>
            Screening Questions ({opportunity.questions.length})
          </Typography>
          <div className="flex flex-col gap-3">
            {opportunity.questions.map((question, index) => (
              <div
                key={question.id}
                className="flex flex-col gap-2 rounded-12 bg-surface-float p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-primary font-bold text-surface-invert typo-footnote">
                    {index + 1}
                  </span>
                  <Typography type={TypographyType.Callout} bold>
                    {question.title}
                  </Typography>
                </div>
                {question.placeholder && (
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    Hint: {question.placeholder}
                  </Typography>
                )}
              </div>
            ))}
          </div>
        </FlexCol>
      )}

      {/* Payment/Plan Info */}
      <FlexCol className="gap-4 rounded-16 border border-border-subtlest-tertiary p-6">
        <Typography type={TypographyType.Title2} bold>
          Payment & Plan
        </Typography>
        <div className="grid gap-4 tablet:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Plan
            </Typography>
            <Typography type={TypographyType.Callout} bold>
              {opportunity.flags?.plan || 'No plan selected'}
            </Typography>
          </div>
          <div className="flex flex-col gap-1">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Batch Size
            </Typography>
            <Typography type={TypographyType.Callout} bold>
              {opportunity.flags?.batchSize || 'N/A'}
            </Typography>
          </div>
        </div>
      </FlexCol>
    </div>
  );
};

ReviewDetailPage.getLayout = getLayout;

export default ReviewDetailPage;
