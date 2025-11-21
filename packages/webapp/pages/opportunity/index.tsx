import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OpportunityHeader } from '@dailydotdev/shared/src/components/opportunity/OpportunityHeader';
import { useActions } from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { getUserOpportunityMatchesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { OpportunityCVUpload } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityCVUpload';
import { OpportunityAllSet } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityAllSet';
import { OpportunityMatchList } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityMatchList';
import { OpportunityMatchStatus } from '@dailydotdev/shared/src/features/opportunity/types';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

const activeStatuses = [
  OpportunityMatchStatus.Pending,
  OpportunityMatchStatus.CandidateAccepted,
];

const JobsPage = (): ReactElement => {
  const { checkHasCompleted, isActionsFetched } = useActions();
  const hasUploadedCV = checkHasCompleted(ActionType.UploadedCV);

  const { data: matchesData, isPending: isMatchesPending } = useQuery({
    ...getUserOpportunityMatchesOptions({ first: 50 }),
    enabled: hasUploadedCV,
  });

  const { activeMatches, matchHistory } = useMemo(() => {
    const matches = matchesData?.edges?.map((edge) => edge.node) || [];
    const active = matches.filter((match) =>
      activeStatuses.includes(match.status),
    );
    const history = matches.filter(
      (match) => !activeStatuses.includes(match.status),
    );

    return { activeMatches: active, matchHistory: history };
  }, [matchesData]);

  if (!isActionsFetched || (hasUploadedCV && isMatchesPending)) {
    return null;
  }

  if (!hasUploadedCV) {
    return (
      <>
        <OpportunityHeader />
        <OpportunityCVUpload />
      </>
    );
  }

  return (
    <>
      <OpportunityHeader />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-col gap-8">
          {activeMatches.length > 0 ? (
            <OpportunityMatchList
              matches={activeMatches}
              title="Active matches"
            />
          ) : (
            <OpportunityAllSet />
          )}
          {matchHistory.length > 0 && (
            <OpportunityMatchList
              matches={matchHistory}
              title="Match history"
            />
          )}
        </div>
      </div>
    </>
  );
};

const geOpportunityLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

JobsPage.getLayout = geOpportunityLayout;
JobsPage.layoutProps = { screenCentered: true };

export default JobsPage;
