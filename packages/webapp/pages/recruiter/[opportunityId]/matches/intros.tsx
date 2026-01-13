import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { ConnectHeader } from '@dailydotdev/shared/src/components/recruiter/ConnectHeader';
import { ConnectProgress } from '@dailydotdev/shared/src/components/recruiter/ConnectProgress';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { MatchCard } from '@dailydotdev/shared/src/features/opportunity/components/MatchCard';
import { useOpportunityMatches } from '@dailydotdev/shared/src/features/opportunity/hooks/useOpportunityMatches';
import { OpportunityProvider } from '@dailydotdev/shared/src/features/opportunity/context/OpportunityContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useQuery } from '@tanstack/react-query';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useRequirePayment } from '@dailydotdev/shared/src/features/opportunity/hooks/useRequirePayment';
import {
  getLayout,
  layoutProps,
} from '../../../../components/layouts/RecruiterSelfServeLayout';

function RecruiterMatchesPage(): ReactElement {
  const router = useRouter();
  const { opportunityId } = router.query;

  const { data: opportunity } = useQuery(
    opportunityByIdOptions({ id: opportunityId as string }),
  );

  const { isCheckingPayment } = useRequirePayment({
    opportunity,
    opportunityId: opportunityId as string,
  });

  const { allMatches, isLoading } = useOpportunityMatches({
    opportunityId: opportunityId as string,
    status: 'recruiter_accepted',
    first: 20,
  });

  if (isLoading || isCheckingPayment) {
    return (
      <OpportunityProvider opportunityId={opportunityId as string}>
        <div className="flex flex-1 flex-col">
          <ConnectHeader activeTab="intros" />
          <ConnectProgress />
          <div className="flex flex-1 items-center justify-center bg-background-subtle">
            <Loader />
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
          {!allMatches.length ? (
            <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-6">
              <Typography type={TypographyType.Mega3} bold center>
                No intros so far
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Tertiary}
                center
              >
                As soon as you made your first match they will show up here.
              </Typography>
            </div>
          ) : (
            <>
              {allMatches.map((match, index) => (
                <MatchCard
                  key={match.userId}
                  match={match}
                  currentMatch={index + 1}
                  totalMatches={totalMatches}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </OpportunityProvider>
  );
}

RecruiterMatchesPage.getLayout = getLayout;
RecruiterMatchesPage.layoutProps = layoutProps;

export default RecruiterMatchesPage;
