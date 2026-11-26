import { gql } from 'graphql-request';
import { gqlBatchRequest } from './batch';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';

export const SQUAD_FREE_BOOST_QUERY = gql`
  query SquadFreeBoost($sourceId: ID!) {
    squadFreeBoost(sourceId: $sourceId) {
      status
      availableUntil
      post {
        id
        title
        image
        commentsPermalink
      }
      campaign {
        budget
        spend
        createdAt
        endedAt
      }
    }
  }
`;

export enum SquadFreeBoostStatus {
  /** Nothing posted that qualifies yet; the next post gets the boost */
  Available = 'available',
  /**
   * The page needs its logo, website and description first. Then its latest
   * post gets the boost, or the next one
   */
  Setup = 'setup',
  /** A post is live and waiting on its content checks, a few minutes */
  Pending = 'pending',
  /** The latest post was held back, so the boost waits for the next one */
  Held = 'held',
  Active = 'active',
  Completed = 'completed',
  /** A plan, an expired offer, or the founder used theirs on another page */
  Unavailable = 'unavailable',
}

export interface SquadFreeBoostPost {
  id: string;
  title: string;
  image?: string | null;
  commentsPermalink: string;
}

// The free $100 boost on a company page's first post, read by its admins and
// moderators. Amounts are in Cores (100 Cores = $1)
export interface SquadFreeBoost {
  status: SquadFreeBoostStatus;
  /** The page's offer ends 30 days after it was created */
  availableUntil: string | null;
  /** The boosted post, or the one pending or held back */
  post: SquadFreeBoostPost | null;
  campaign: {
    budget: number;
    spend: number;
    createdAt: string;
    endedAt: string;
  } | null;
}

export const squadFreeBoostQueryOptions = ({
  user,
  sourceId,
}: {
  user?: Pick<LoggedUser, 'id'>;
  sourceId?: string;
}) => ({
  queryKey: generateQueryKey(RequestKey.SquadFreeBoost, user, sourceId),
  queryFn: async (): Promise<SquadFreeBoost> => {
    const res = await gqlBatchRequest<{ squadFreeBoost: SquadFreeBoost }>(
      SQUAD_FREE_BOOST_QUERY,
      { sourceId },
    );

    return res.squadFreeBoost;
  },
  // Pending turns into a boost within minutes, and a live boost moves
  // as the analytics land every 5 minutes
  refetchInterval: (query: { state: { data?: SquadFreeBoost } }) =>
    [SquadFreeBoostStatus.Pending, SquadFreeBoostStatus.Active].includes(
      query.state.data?.status as SquadFreeBoostStatus,
    )
      ? 60_000
      : false,
  staleTime: StaleTime.Default,
  enabled: !!user && !!sourceId,
});
