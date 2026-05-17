import { useInfiniteQuery } from '@tanstack/react-query';
import { useContext, useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import AuthContext from '../../contexts/AuthContext';
import {
  ReferralCampaignKey,
  useReferralCampaign,
} from '../../hooks/referral/useReferralCampaign';
import { REFERRED_USERS_QUERY } from '../../graphql/users';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
} from '../../lib/query';
import type { ReferredUsersData } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';
import type { UserShortProfile } from '../../lib/user';
import { link } from '../../lib/links';

/**
 * v1 reward shape, hard-coded until backend exposes per-invite reward
 * metadata. Mirrors what the existing /settings/invite copy already
 * promises ("200 Cores per invite").
 */
export const INVITE_LEDGER_CORES_PER_INVITE = 200;
export const INVITE_LEDGER_PLUS_DAYS_PER_INVITE = 7;
export const INVITE_LEDGER_RECENT_JOINS_DAYS = 7;

export type InviteLedgerRowStatus = 'joined' | 'pending' | 'expired';

export interface InviteLedgerRow {
  user: UserShortProfile;
  /**
   * Backend only returns developers who already joined through the link
   * today, so every row is "joined" in v1. The shape supports `pending`
   * and `expired` so the same component renders unchanged once the API
   * exposes those states.
   */
  status: InviteLedgerRowStatus;
  coresToInviter: number;
}

export interface InviteLedgerSnapshot {
  inviteUrl: string;
  invitesAccepted: number;
  coresGiftedToFriends: number;
  plusDaysGiftedToFriends: number;
  coresEarned: number;
  recentJoins: InviteLedgerRow[];
  rows: InviteLedgerRow[];
  hasNews: boolean;
  isLoading: boolean;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  /** Stable identifier of the current "recent joins" cohort for dismissal. */
  newsCohortKey: string;
}

const emptySnapshot = (): Omit<
  InviteLedgerSnapshot,
  'inviteUrl' | 'fetchNextPage'
> => ({
  invitesAccepted: 0,
  coresGiftedToFriends: 0,
  plusDaysGiftedToFriends: 0,
  coresEarned: 0,
  recentJoins: [],
  rows: [],
  hasNews: false,
  isLoading: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  newsCohortKey: '',
});

export const useInviteLedger = (): InviteLedgerSnapshot => {
  const { user } = useContext(AuthContext);
  const { url, referredUsersCount } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteUrl = url || link.referral.defaultUrl;
  const referredKey = generateQueryKey(RequestKey.ReferredUsers, user);

  const usersResult = useInfiniteQuery<ReferredUsersData>({
    queryKey: referredKey,
    queryFn: ({ pageParam }) =>
      gqlClient.request(REFERRED_USERS_QUERY, {
        after: typeof pageParam === 'string' ? pageParam : undefined,
      }),
    initialPageParam: '',
    enabled: !!user?.id,
    getNextPageParam: ({ referredUsers }) =>
      getNextPageParam(referredUsers?.pageInfo),
  });

  const rows: InviteLedgerRow[] = useMemo(() => {
    const list: InviteLedgerRow[] = [];
    usersResult.data?.pages.forEach((page) => {
      page?.referredUsers?.edges?.forEach(({ node }) => {
        list.push({
          user: node as UserShortProfile,
          status: 'joined',
          coresToInviter: INVITE_LEDGER_CORES_PER_INVITE,
        });
      });
    });
    return list;
  }, [usersResult.data]);

  const now = Date.now();
  const recentJoins = useMemo(
    () =>
      rows.filter(
        (row) =>
          differenceInDays(now, new Date(row.user.createdAt)) <=
          INVITE_LEDGER_RECENT_JOINS_DAYS,
      ),
    [rows, now],
  );

  const newsCohortKey = useMemo(
    () => recentJoins.map((r) => r.user.id).join(','),
    [recentJoins],
  );

  const totals = {
    invitesAccepted: referredUsersCount || rows.length,
    coresGiftedToFriends:
      (referredUsersCount || rows.length) * INVITE_LEDGER_CORES_PER_INVITE,
    plusDaysGiftedToFriends:
      (referredUsersCount || rows.length) * INVITE_LEDGER_PLUS_DAYS_PER_INVITE,
    coresEarned:
      (referredUsersCount || rows.length) * INVITE_LEDGER_CORES_PER_INVITE,
  };

  if (!user?.id) {
    return {
      inviteUrl,
      fetchNextPage: async () => undefined,
      ...emptySnapshot(),
    };
  }

  return {
    inviteUrl,
    ...totals,
    recentJoins,
    rows,
    hasNews: recentJoins.length > 0,
    isLoading: usersResult.isLoading,
    fetchNextPage: usersResult.fetchNextPage,
    hasNextPage: !!usersResult.hasNextPage,
    isFetchingNextPage: usersResult.isFetchingNextPage,
    newsCohortKey,
  };
};
