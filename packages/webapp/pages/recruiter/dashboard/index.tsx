import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getOpportunitiesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import type { Opportunity } from '@dailydotdev/shared/src/features/opportunity/types';
import { OpportunityState } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  getLayout,
  layoutProps,
} from '../../../components/layouts/RecruiterLayout';

type OpportunityCardProps = {
  opportunity: Opportunity;
};

const OpportunityCard = ({
  opportunity,
}: OpportunityCardProps): ReactElement => {
  const { title, organization, id } = opportunity;

  return (
    <Button
      tag="a"
      href={`${webappUrl}recruiter/opportunities/${id}`}
      variant={ButtonVariant.Tertiary}
      className="flex !h-auto flex-col gap-3 !rounded-16 !border !border-border-subtlest-tertiary !bg-surface-float !p-4 text-left !transition-colors hover:!border-border-subtlest-secondary"
    >
      {organization?.image && (
        <img
          src={organization.image}
          alt={organization.name}
          className="h-12 w-12 rounded-12 object-cover"
        />
      )}

      <div className="flex flex-1 flex-col gap-1">
        <Typography type={TypographyType.Title3} bold>
          {title}
        </Typography>
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
          {organization?.name || 'Company'}
        </Typography>
      </div>

      <div className="mt-auto flex items-center gap-2">
        <span className="rounded-8 bg-accent-cabbage-default px-2 py-1 text-white typo-caption1">
          Live
        </span>
      </div>
    </Button>
  );
};

const RecruiterDashboard = (): ReactElement => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();

  // Fetch all opportunities (defaults to LIVE state)
  const { data: opportunitiesData, isLoading } = useQuery(
    getOpportunitiesOptions('2'),
  );

  // Extract opportunities from connection edges
  const opportunities = opportunitiesData?.edges.map((edge) => edge.node) || [];

  // Check if user is a recruiter (has created at least one opportunity)
  const isRecruiter = opportunities.length > 0;
  const hasAccess = user?.isTeamMember || isRecruiter;

  if (!isAuthReady) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="relative mx-4 mt-10 max-w-[47.875rem] tablet:mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <Typography color={TypographyColor.Tertiary}>
            Loading your opportunities...
          </Typography>
        </div>
      </div>
    );
  }

  // Redirect if user doesn't have access
  if (!hasAccess && opportunitiesData) {
    router.replace('/');
    return null;
  }

  if (!isRecruiter && opportunitiesData) {
    return (
      <div className="relative mx-4 mt-10 max-w-[47.875rem] tablet:mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Typography type={TypographyType.Title1} bold className="mb-4">
            No opportunities yet
          </Typography>
          <Typography color={TypographyColor.Tertiary}>
            You haven&apos;t created any job opportunities yet.
          </Typography>
        </div>
      </div>
    );
  }

  const activeOpportunities = opportunities.filter(
    (opp) => opp.state === OpportunityState.LIVE,
  );

  return (
    <div className="relative mx-4 mt-10 max-w-[47.875rem] tablet:mx-auto">
      <div className="flex flex-col gap-8 tablet:mx-4 laptop:mx-0">
        <div className="flex flex-col gap-2 text-center">
          <Typography type={TypographyType.Title1} bold>
            Recruiter Dashboard
          </Typography>
          <Typography color={TypographyColor.Tertiary}>
            Manage your active job applications
          </Typography>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Typography type={TypographyType.Title2} bold>
              Active Opportunities ({activeOpportunities.length})
            </Typography>
          </div>

          {activeOpportunities.length > 0 ? (
            <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
              {activeOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-16 border border-border-subtlest-tertiary bg-surface-float py-12">
              <Typography color={TypographyColor.Tertiary}>
                No active opportunities at the moment
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

RecruiterDashboard.getLayout = getLayout;
RecruiterDashboard.layoutProps = layoutProps;

export default RecruiterDashboard;
