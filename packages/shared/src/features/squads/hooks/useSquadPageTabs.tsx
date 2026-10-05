import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { SourcePermissions } from '../../../graphql/sources';
import { verifyPermission } from '../../../graphql/squads';
import { useSquadPageContext } from '../SquadPageContext';
import { hasSquadFeature } from '../lib/features';
import { getSquadTabUrl, isSquadPageTab, SquadPageTab } from '../lib/routes';
import type { SquadPageExtraTab } from '../components/SquadPageLayout';
import { SquadJobsTab } from '../components/jobs/SquadJobs';
import { SquadPerksTab } from '../components/perks/SquadPerks';
import { useSquadJobs } from './useSquadJobs';
import { useSquadPerks } from './useSquadPerks';

/**
 * The Jobs and Perks tabs beside Posts. Each shows once its feature is on
 * and it has something in it; editors see it empty too, as a nudge.
 */
export const useSquadPageTabs = () => {
  const router = useRouter();
  const { squad } = useSquadPageContext();
  const { jobs } = useSquadJobs(squad);
  const { perks } = useSquadPerks(squad);
  const canEdit = verifyPermission(squad, SourcePermissions.Edit);
  const tabs: SquadPageExtraTab[] = [];

  if (hasSquadFeature(squad, 'jobs') && (jobs.length || canEdit)) {
    tabs.push({
      id: SquadPageTab.Jobs,
      label: 'Jobs',
      content: <SquadJobsTab />,
    });
  }

  if (hasSquadFeature(squad, 'perks') && (perks.length || canEdit)) {
    tabs.push({
      id: SquadPageTab.Perks,
      label: 'Perks',
      content: <SquadPerksTab />,
    });
  }

  const requested = router?.query?.tab;
  const initialTab = isSquadPageTab(requested) ? requested : SquadPageTab.Posts;

  // Keep the tab in the address, so Back from a role or perk returns to it
  const onTabChange = useCallback(
    (tab: SquadPageTab) =>
      router?.replace(getSquadTabUrl(squad.handle, tab), undefined, {
        shallow: true,
        scroll: false,
      }),
    [router, squad.handle],
  );

  return { tabs, initialTab, onTabChange };
};
