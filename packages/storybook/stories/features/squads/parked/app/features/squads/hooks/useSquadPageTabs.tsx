import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { SourcePermissions } from '@dailydotdev/shared/src/graphql/sources';
import { verifyPermission } from '@dailydotdev/shared/src/graphql/squads';
import { useSquadPageContext } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { hasSquadFeature } from '../lib/features';
import { isSquadPageTab, SquadPageTab } from '../lib/routes';
import type { SquadPageExtraTab } from '../components/SquadPageLayout';
import { SquadJobsTab } from '../components/jobs/SquadJobs';
import { SquadPerksTab } from '../components/perks/SquadPerks';
import { useSquadJobs } from './useSquadJobs';
import { useSquadPerks } from './useSquadPerks';

/**
 * The Jobs and Perks tabs beside Posts. Each shows once its feature is on
 * and it has something in it; editors see it empty too, as a nudge. A tab
 * asked for in the address (Back from a role or a perk) shows while its
 * data loads, so the feed never mounts just to be swapped out.
 */
export const useSquadPageTabs = () => {
  const router = useRouter();
  const { squad } = useSquadPageContext();
  // Parked: in the app, the jobs and perks flags arrive by their own query
  // (a deploy bridge in SquadPageContext); here they are on the squad
  const areFeaturesReady = true;
  const { jobs, isPending: isJobsPending } = useSquadJobs(squad);
  const { perks, isPending: isPerksPending } = useSquadPerks(squad);
  const canEdit = verifyPermission(squad, SourcePermissions.Edit);
  const requested = router?.query?.tab;
  const initialTab = isSquadPageTab(requested) ? requested : SquadPageTab.Posts;
  const tabs: SquadPageExtraTab[] = [];

  const shows = (
    tab: SquadPageTab,
    isOn: boolean,
    count: number,
    isPending: boolean,
  ): boolean => {
    if (isOn && (count > 0 || canEdit)) {
      return true;
    }

    // Still finding out: keep the asked-for tab rather than the feed
    return initialTab === tab && (!areFeaturesReady || (isOn && isPending));
  };

  if (
    shows(
      SquadPageTab.Jobs,
      hasSquadFeature(squad, 'jobs'),
      jobs.length,
      isJobsPending,
    )
  ) {
    tabs.push({
      id: SquadPageTab.Jobs,
      label: 'Jobs',
      content: <SquadJobsTab />,
    });
  }

  if (
    shows(
      SquadPageTab.Perks,
      hasSquadFeature(squad, 'perks'),
      perks.length,
      isPerksPending,
    )
  ) {
    tabs.push({
      id: SquadPageTab.Perks,
      label: 'Perks',
      content: <SquadPerksTab />,
    });
  }

  // Keep the tab in the address, so Back from a role or perk returns to
  // it, and keep everything else there (an in-squad search, a modal)
  const onTabChange = useCallback(
    (tab: SquadPageTab) => {
      if (!router) {
        return;
      }

      const rest = { ...router.query };
      delete rest.tab;
      router.replace(
        {
          pathname: router.pathname,
          query: tab === SquadPageTab.Posts ? rest : { ...rest, tab },
        },
        undefined,
        { shallow: true, scroll: false },
      );
    },
    [router],
  );

  return { tabs, initialTab, onTabChange };
};
