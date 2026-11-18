import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { Squad } from './sources';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import { hasSquadFeature } from '../features/squads/lib/features';

export interface SquadAutoPostingFeed {
  url: string;
}

export const SQUAD_AUTO_POSTING_FEEDS_QUERY = gql`
  query SquadAutoPostingFeeds($sourceId: ID!) {
    squadAutoPostingFeeds(sourceId: $sourceId) {
      url
    }
  }
`;

// The feeds and pages ops connected to post into an Enterprise squad
export const squadAutoPostingFeedsQueryOptions = ({
  squad,
  user,
}: {
  squad?: Pick<Squad, 'id' | 'handle' | 'features'>;
  user?: Pick<LoggedUser, 'id'>;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.Squad,
    user,
    squad?.handle,
    'auto-posting-feeds',
  ),
  queryFn: async (): Promise<SquadAutoPostingFeed[]> => {
    const res = await gqlClient.request<{
      squadAutoPostingFeeds: SquadAutoPostingFeed[];
    }>(SQUAD_AUTO_POSTING_FEEDS_QUERY, { sourceId: squad?.id });

    return res.squadAutoPostingFeeds;
  },
  enabled: !!squad?.id && hasSquadFeature(squad, 'verified'),
  staleTime: StaleTime.Default,
  retry: false,
});
