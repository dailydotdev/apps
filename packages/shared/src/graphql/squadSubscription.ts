import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { EmptyResponse } from './emptyResponse';
import type { LoggedUser, UserShortProfile } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import type {
  SquadPlan,
  StartupsCashbackPromo,
} from '../features/squads/lib/plans';
import { SourceMemberRole } from './sources';
import { USER_SHORT_INFO_FRAGMENT } from './fragments';

export const SQUAD_SUBSCRIPTION_QUERY = gql`
  query SquadSubscription($sourceId: ID!) {
    squadSubscription(sourceId: $sourceId) {
      plan
      status
      seatLimit
      seatsUsed
      ownerId
      cashbackPercentage
      cashbackPromoEndsAt
    }
  }
`;

export const STARTUPS_CASHBACK_PROMO_QUERY = gql`
  query StartupsCashbackPromo {
    startupsCashbackPromo {
      percentage
      months
    }
  }
`;

export const SQUAD_SUBSCRIPTION_BALANCE_QUERY = gql`
  query SquadSubscriptionBalance($sourceId: ID!) {
    squadSubscription(sourceId: $sourceId) {
      coresBalance
    }
  }
`;

// A squad's daily.dev for Startups subscription, read by its admins and
// moderators. `plan` is null without an active one.
export interface SquadSubscription {
  plan: SquadPlan | null;
  status: string;
  seatLimit: number;
  seatsUsed: number;
  ownerId: string | null;
  /** The cashback on each payment now, the launch promo's while it lasts. */
  cashbackPercentage: number;
  cashbackPromoEndsAt: string | null;
}

export const squadSubscriptionQueryOptions = ({
  user,
  sourceId,
  refetchInterval,
}: {
  user?: Pick<LoggedUser, 'id'>;
  sourceId?: string;
  /** Polls while the checkout waits for the payment webhook. */
  refetchInterval?:
    | number
    | false
    | ((query: { state: { data?: SquadSubscription } }) => number | false);
}) => ({
  queryKey: generateQueryKey(RequestKey.SquadSubscription, user, sourceId),
  queryFn: async (): Promise<SquadSubscription> => {
    const res = await gqlClient.request<{
      squadSubscription: SquadSubscription;
    }>(SQUAD_SUBSCRIPTION_QUERY, { sourceId });

    return res.squadSubscription;
  },
  enabled: !!user?.id && !!sourceId,
  refetchInterval,
});

// The launch promo for new subscriptions, null while it is off
export const startupsCashbackPromoQueryOptions = () => ({
  queryKey: [RequestKey.StartupsCashbackPromo],
  queryFn: async (): Promise<StartupsCashbackPromo | null> => {
    const res = await gqlClient.request<{
      startupsCashbackPromo: StartupsCashbackPromo | null;
    }>(STARTUPS_CASHBACK_PROMO_QUERY);

    return res.startupsCashbackPromo;
  },
  staleTime: StaleTime.Default,
});

export const squadSubscriptionBalanceQueryOptions = ({
  user,
  sourceId,
  enabled = true,
}: {
  user?: Pick<LoggedUser, 'id'>;
  sourceId?: string;
  enabled?: boolean;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.SquadSubscription,
    user,
    sourceId,
    'balance',
  ),
  queryFn: async (): Promise<number> => {
    const res = await gqlClient.request<{
      squadSubscription: { coresBalance: number };
    }>(SQUAD_SUBSCRIPTION_BALANCE_QUERY, { sourceId });

    return res.squadSubscription.coresBalance;
  },
  enabled: enabled && !!user?.id && !!sourceId,
});

const SQUAD_SEAT_MEMBERS_QUERY = gql`
  query SquadSeatMembers($sourceId: ID!, $role: String) {
    sourceMembers(sourceId: $sourceId, role: $role, first: 50) {
      edges {
        node {
          role
          seat
          user {
            ...UserShortInfo
          }
        }
      }
    }
  }
  ${USER_SHORT_INFO_FRAGMENT}
`;

export interface SquadSeatMember {
  role: SourceMemberRole;
  seat: boolean;
  user: UserShortProfile;
}

export const squadSeatMembersQueryOptions = ({
  user,
  sourceId,
}: {
  user?: Pick<LoggedUser, 'id'>;
  sourceId?: string;
}) => ({
  queryKey: generateQueryKey(RequestKey.SquadSeats, user, sourceId),
  queryFn: async (): Promise<SquadSeatMember[]> => {
    // Only admins and moderators can hold a paid seat. The moderator role
    // already returns admins too, so one request lists everyone once.
    const { sourceMembers } = await gqlClient.request<{
      sourceMembers: { edges: { node: SquadSeatMember }[] };
    }>(SQUAD_SEAT_MEMBERS_QUERY, {
      sourceId,
      role: SourceMemberRole.Moderator,
    });

    return sourceMembers.edges.map(({ node }) => node);
  },
  enabled: !!user?.id && !!sourceId,
});

const ADD_SQUAD_SEAT_MUTATION = gql`
  mutation AddSquadSeat($sourceId: ID!, $userId: ID!) {
    addSquadSeat(sourceId: $sourceId, userId: $userId) {
      _
    }
  }
`;

const REMOVE_SQUAD_SEAT_MUTATION = gql`
  mutation RemoveSquadSeat($sourceId: ID!, $userId: ID!) {
    removeSquadSeat(sourceId: $sourceId, userId: $userId) {
      _
    }
  }
`;

export const setSquadSeat = async ({
  sourceId,
  userId,
  seat,
}: {
  sourceId: string;
  userId: string;
  seat: boolean;
}): Promise<EmptyResponse> =>
  gqlClient.request(
    seat ? ADD_SQUAD_SEAT_MUTATION : REMOVE_SQUAD_SEAT_MUTATION,
    { sourceId, userId },
  );

const SAVE_STARTUPS_GOALS_MUTATION = gql`
  mutation SaveStartupsGoals(
    $sourceId: ID!
    $goals: [String!]!
    $other: String
  ) {
    saveStartupsGoals(sourceId: $sourceId, goals: $goals, other: $other) {
      _
    }
  }
`;

// Kept on the buyer, so lifecycle emails can lead with what they came for
export const saveStartupsGoals = async (variables: {
  sourceId: string;
  goals: string[];
  other?: string;
}): Promise<EmptyResponse> =>
  gqlClient.request(SAVE_STARTUPS_GOALS_MUTATION, variables);
