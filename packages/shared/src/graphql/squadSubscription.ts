import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { EmptyResponse } from './emptyResponse';
import type { LoggedUser, UserShortProfile } from '../lib/user';
import { generateQueryKey, RequestKey } from '../lib/query';
import type { SquadPlan } from '../features/squads/lib/plans';
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

// Only admins and moderators can hold a paid seat
export const SQUAD_SEAT_ROLES = [
  SourceMemberRole.Admin,
  SourceMemberRole.Moderator,
];

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
    const results = await Promise.all(
      SQUAD_SEAT_ROLES.map((role) =>
        gqlClient.request<{
          sourceMembers: { edges: { node: SquadSeatMember }[] };
        }>(SQUAD_SEAT_MEMBERS_QUERY, { sourceId, role }),
      ),
    );

    return results.flatMap(({ sourceMembers }) =>
      sourceMembers.edges.map(({ node }) => node),
    );
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
