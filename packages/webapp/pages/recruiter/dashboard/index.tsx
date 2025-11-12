import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getOpportunitiesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import type { Opportunity } from '@dailydotdev/shared/src/features/opportunity/types';
import { OpportunityState } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import { getLayout } from '../../../components/layouts/RecruiterLayout';

type OpportunityCardProps = {
  opportunity: Opportunity;
  onViewDetails: () => void;
};

const OpportunityCard = ({
  opportunity,
  onViewDetails,
}: OpportunityCardProps): ReactElement => {
  const { title, organization } = opportunity;

  return (
    <button
      type="button"
      onClick={onViewDetails}
      className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left transition-colors hover:border-border-subtlest-secondary"
    >
      {organization?.image && (
        <img
          src={organization.image}
          alt={organization.name}
          className="h-12 w-12 rounded-12 object-cover"
        />
      )}

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="font-bold typo-title3">{title}</h3>
        <p className="text-text-tertiary typo-body">
          {organization?.name || 'Company'}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2">
        <span className="rounded-8 bg-accent-cabbage-default px-2 py-1 text-text-primary typo-caption1">
          Live
        </span>
      </div>
    </button>
  );
};

const RecruiterDashboard = (): ReactElement => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();

  // Fetch all opportunities (defaults to LIVE state)
  const { data: opportunitiesData, isLoading } = useQuery(
    getOpportunitiesOptions(),
  );

  // Extract opportunities from connection edges
  const opportunities = opportunitiesData?.edges.map((edge) => edge.node) || [];

  // Check if user is a recruiter (has created at least one opportunity)
  const isRecruiter = opportunities.length > 0;

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
          <p className="text-text-tertiary">Loading your opportunities...</p>
        </div>
      </div>
    );
  }

  if (!isRecruiter && opportunitiesData) {
    return (
      <div className="relative mx-4 mt-10 max-w-[47.875rem] tablet:mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="mb-4 font-bold typo-title1">No opportunities yet</h1>
          <p className="text-text-tertiary">
            You haven&apos;t created any job opportunities yet.
          </p>
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
          <h1 className="font-bold typo-title1">Recruiter Dashboard</h1>
          <p className="text-text-tertiary">
            Manage your active job opportunities and applications
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold typo-title2">
              Active Opportunities ({activeOpportunities.length})
            </h2>
          </div>

          {activeOpportunities.length > 0 ? (
            <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
              {activeOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onViewDetails={() =>
                    router.push(`/recruiter/opportunities/${opportunity.id}`)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-16 border border-border-subtlest-tertiary bg-surface-float py-12">
              <p className="text-text-tertiary">
                No active opportunities at the moment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

RecruiterDashboard.getLayout = getLayout;

export default RecruiterDashboard;
