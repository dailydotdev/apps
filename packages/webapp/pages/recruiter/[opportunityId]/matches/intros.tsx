import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { ConnectHeader } from '@dailydotdev/shared/src/components/recruiter/ConnectHeader';
import { ConnectProgress } from '@dailydotdev/shared/src/components/recruiter/ConnectProgress';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { MatchCard } from '@dailydotdev/shared/src/features/opportunity/components/MatchCard';
import { useOpportunityMatches } from '@dailydotdev/shared/src/features/opportunity/hooks/useOpportunityMatches';
import { OpportunityProvider } from '@dailydotdev/shared/src/features/opportunity/context/OpportunityContext';
import { getLayout } from '../../../../components/layouts/RecruiterSelfServeLayout';

function RecruiterMatchesPage(): ReactElement {
  const router = useRouter();
  const { opportunityId } = router.query;

  const { allMatches, isLoading } = useOpportunityMatches({
    opportunityId: opportunityId as string,
    status: 'recruiter_accepted',
    first: 20,
  });

  if (isLoading) {
    return (
      <OpportunityProvider opportunityId={opportunityId as string}>
        <div className="flex flex-1 flex-col">
          <ConnectHeader activeTab="intros" />
          <ConnectProgress />
          <div className="flex flex-1 items-center justify-center">
            <Loader />
          </div>
        </div>
      </OpportunityProvider>
    );
  }

  if (!allMatches.length) {
    return (
      <OpportunityProvider opportunityId={opportunityId as string}>
        <div className="flex flex-1 flex-col">
          <ConnectHeader activeTab="intros" />
          <ConnectProgress />
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-text-tertiary">No matches found</p>
          </div>
        </div>
      </OpportunityProvider>
    );
  }

  const totalMatches = allMatches.length;

  return (
    <OpportunityProvider opportunityId={opportunityId as string}>
      <div className="flex flex-1 flex-col">
        <ConnectHeader activeTab="intros" />
        <ConnectProgress />
        <div className="flex flex-1 flex-col gap-6 bg-background-subtle p-6">
          {allMatches.map((match, index) => (
            <MatchCard
              key={match.userId}
              match={match}
              currentMatch={index + 1}
              totalMatches={totalMatches}
            />
          ))}
        </div>
      </div>
    </OpportunityProvider>
  );
}

RecruiterMatchesPage.getLayout = getLayout;

export default RecruiterMatchesPage;
