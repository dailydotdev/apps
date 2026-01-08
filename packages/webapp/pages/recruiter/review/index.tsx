import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getOpportunitiesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import type { Opportunity } from '@dailydotdev/shared/src/features/opportunity/types';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getLayout } from '../../../components/layouts/RecruiterLayout';

type OpportunityCardProps = {
  opportunity: Opportunity;
};

const OpportunityCard = ({
  opportunity,
}: OpportunityCardProps): ReactElement => {
  const { title, organization, id, tldr } = opportunity;

  return (
    <Button
      tag="a"
      href={`${webappUrl}recruiter/review/${id}`}
      variant={ButtonVariant.Tertiary}
      className="flex !h-auto flex-col gap-3 !rounded-16 !border !border-border-subtlest-tertiary !bg-surface-float !p-4 text-left !transition-colors hover:!border-border-subtlest-secondary"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {organization?.image && (
            <img
              src={organization.image}
              alt={organization.name}
              className="h-10 w-10 rounded-10 object-cover"
            />
          )}
          <div className="flex flex-col gap-0.5">
            <Typography type={TypographyType.Body} bold>
              {title}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {organization?.name || 'No company'}
            </Typography>
          </div>
        </div>
        <span className="shrink-0 rounded-8 bg-status-warning px-2 py-1 text-white typo-caption1">
          In Review
        </span>
      </div>
      {tldr && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="line-clamp-2"
        >
          {tldr}
        </Typography>
      )}
    </Button>
  );
};

const ReviewListPage = (): ReactElement => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();

  // Fetch opportunities in IN_REVIEW state (state = 4)
  const { data: opportunitiesData, isLoading } = useQuery(
    getOpportunitiesOptions('4'),
  );

  const opportunities = opportunitiesData?.edges.map((edge) => edge.node) || [];

  if (!isAuthReady) {
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

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8">
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.LargeTitle} bold>
          Job Review Queue
        </Typography>
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
          Review and approve job postings before they go live
        </Typography>
      </div>

      {/* Pending Review */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Typography type={TypographyType.Title2} bold>
            Pending Review
          </Typography>
          <span className="rounded-8 bg-status-warning px-2 py-0.5 text-white typo-caption1">
            {opportunities.length}
          </span>
        </div>
        {opportunities.length > 0 ? (
          <div className="flex flex-col gap-3">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6 text-center">
            <Typography color={TypographyColor.Tertiary}>
              No jobs pending review
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

ReviewListPage.getLayout = getLayout;

export default ReviewListPage;
