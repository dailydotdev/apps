import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { Squad } from '../graphql/sources';
import type { SquadStaticData } from '../graphql/squads';
import { getSquadStaticFields } from '../graphql/squads';
import { RequestKey, StaleTime } from '../lib/query';

const TOP_SQUAD_PLACEHOLDER_IMAGE =
  'https://media.daily.dev/image/upload/v1672041320/squads/squad_placeholder.jpg';

/**
 * Mirrors the curated list rendered in the explore page's
 * `Top active squads` strip — the most active public squads over the last
 * 30 days. Kept inline because the list is currently FE-curated.
 */
export const TOP_ACTIVE_SQUADS_30D = [
  { name: 'PHP Dev', handle: 'phpdev' },
  { name: 'Machine Learning News', handle: 'mlnews' },
  { name: 'World of Technology', handle: 'thejvmbender' },
  { name: 'Smarter Articles', handle: 'smarterarticles' },
  { name: 'Build With GenAI', handle: 'buildwithgenai' },
  { name: 'Daily Open Source Tools', handle: 'dailyopensourcetools' },
  { name: 'DevOps Daily', handle: 'devopsdaily' },
  { name: 'All Pc Softs', handle: 'allpcsofts' },
  { name: 'Horde', handle: 'horde' },
  { name: 'Grimspin', handle: 'grimspin' },
  { name: 'Devs Together Strong', handle: 'devstogetherstrong' },
  { name: 'Lonely Programmer', handle: 'lonely_programmer' },
  { name: 'Dev World', handle: 'dev_world' },
  { name: 'Just Java', handle: 'justjava' },
  { name: 'Tech GSM Softwares', handle: 'techgsmsoftwares' },
  { name: 'Data Engineering', handle: 'sspdata' },
  { name: 'Zero To Mastery', handle: 'zerotomastery' },
  { name: 'Dev Squad', handle: 'devsquad' },
  { name: 'AI', handle: 'ai' },
  { name: 'Platform & AI', handle: 'platformai' },
] as const;

export interface TopActiveSquad {
  id: string;
  name: string;
  handle: string;
  permalink: string;
  image: string;
  membersCount?: number;
  currentMember?: Squad['currentMember'];
}

interface UseTopActiveSquadsParams {
  enabled?: boolean;
  /** Limit how many of the curated handles to fetch (defaults to all 20). */
  limit?: number;
}

interface UseTopActiveSquadsResult {
  squads: TopActiveSquad[];
  isPending: boolean;
}

export const useTopActiveSquads = ({
  enabled = true,
  limit = TOP_ACTIVE_SQUADS_30D.length,
}: UseTopActiveSquadsParams = {}): UseTopActiveSquadsResult => {
  const seeds = useMemo(() => TOP_ACTIVE_SQUADS_30D.slice(0, limit), [limit]);

  const queries = useQueries({
    queries: seeds.map(({ handle }) => ({
      queryKey: [RequestKey.Squad, 'top-active', handle],
      queryFn: () => getSquadStaticFields(handle),
      enabled,
      staleTime: StaleTime.Default,
    })),
  });

  const isPending = queries.some((query) => query.isPending);

  const squads = useMemo<TopActiveSquad[]>(
    () =>
      seeds.map(({ name, handle }, index) => {
        const data = queries[index]?.data as SquadStaticData | undefined;

        return {
          id: data?.id ?? `top-active-squad-${index + 1}-${handle}`,
          name: data?.name ?? name,
          handle,
          permalink:
            data?.permalink ?? `https://app.daily.dev/squads/${handle}`,
          image: data?.image ?? TOP_SQUAD_PLACEHOLDER_IMAGE,
          membersCount: data?.membersCount,
          currentMember: data?.currentMember,
        };
      }),
    [seeds, queries],
  );

  return { squads, isPending };
};
