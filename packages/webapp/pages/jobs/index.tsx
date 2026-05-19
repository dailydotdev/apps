import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OpportunityHeader } from '@dailydotdev/shared/src/components/opportunity/OpportunityHeader';
import { useActions } from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { getUserOpportunityMatchesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { OpportunityCVUpload } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityCVUpload';
import { OpportunityAllSet } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityAllSet';
import { OpportunityHiring } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityHiring';
import { OpportunityMatchList } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityMatchList';
import { OpportunityMatchStatus } from '@dailydotdev/shared/src/features/opportunity/types';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { opportunityBriefcase } from '@dailydotdev/shared/src/lib/image';
import { IntroHeader } from '@dailydotdev/shared/src/features/opportunity/components/IntroHeader';

import { OpportunityFAQ } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityFAQ';
import { OpportunityBenefits } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityBenefits';
import { OpportunityHowItWorks } from '@dailydotdev/shared/src/features/opportunity/components/OpportunityHowItWorks';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons';
import { settingsUrl, webappUrl } from '@dailydotdev/shared/src/lib/constants';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

const JobsPageHeader = (): ReactElement => (
  <PageHeader title="Jobs">
    <Link href={`${webappUrl}jobs/how-it-works`} passHref>
      <Button tag="a" variant={ButtonVariant.Tertiary} size={ButtonSize.Small}>
        How it works
      </Button>
    </Link>
    <Link href={`${settingsUrl}/job-preferences`} passHref>
      <Button
        tag="a"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<FilterIcon />}
        aria-label="Job preferences"
      />
    </Link>
  </PageHeader>
);

const activeStatuses = [
  OpportunityMatchStatus.Pending,
  OpportunityMatchStatus.CandidateAccepted,
];

const JobsPage = (): ReactElement | null => {
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const { sidebarRendered } = useSidebarRendered();
  const hasUploadedCV = checkHasCompleted(ActionType.UploadedCV);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2 && isLaptop;

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

  useEffect(() => {
    if (!isActionsFetched) {
      return;
    }

    completeAction(ActionType.OpportunityWelcomePage);
  }, [completeAction, isActionsFetched]);

  if (!isActionsFetched || (hasUploadedCV && isMatchesPending)) {
    return null;
  }

  if (!hasUploadedCV) {
    return (
      <>
        {isV2Laptop && <JobsPageHeader />}
        <div className="mx-auto w-full border-border-subtlest-tertiary laptop:max-w-[48rem] laptop:border-x">
          {!isV2Laptop && <OpportunityHeader />}
          <FlexCol className="mx-auto max-w-xl items-center gap-8 px-4 py-6 laptop:max-w-4xl">
          {!sidebarRendered && (
            <img
              src={opportunityBriefcase}
              className="max-w-36"
              alt="daily.dev jobs"
            />
          )}
          <IntroHeader />
          <OpportunityCVUpload />
          {sidebarRendered && (
            <>
              <OpportunityBenefits />
              <OpportunityHowItWorks />
              <OpportunityFAQ />
            </>
          )}
        </FlexCol>
        </div>
      </>
    );
  }

  return (
    <>
      {isV2Laptop && <JobsPageHeader />}
      <div className="mx-auto w-full border-border-subtlest-tertiary laptop:max-w-[48rem] laptop:border-x">
        {!isV2Laptop && <OpportunityHeader />}
        <div className="mx-auto flex w-full flex-1 flex-col justify-center px-4 py-6 laptop:max-w-4xl">
        <div className="flex flex-col gap-8">
          {activeMatches.length > 0 ? (
            <OpportunityMatchList
              matches={activeMatches}
              title="Active matches"
            />
          ) : (
            <OpportunityAllSet />
          )}
          <OpportunityHiring />
          {matchHistory.length > 0 && (
            <OpportunityMatchList
              matches={matchHistory}
              title="Match history"
            />
          )}
          {sidebarRendered && <OpportunityFAQ />}
        </div>
      </div>
      </div>
    </>
  );
};

const geOpportunityLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

JobsPage.getLayout = geOpportunityLayout;
JobsPage.layoutProps = { screenCentered: false };

export default JobsPage;
