import { useInfiniteQuery } from '@tanstack/react-query';
import { useContext, useEffect, useMemo, useState } from 'react';
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
import { getInviteLedgerDemoMode } from './debug';
import { getDemoSnapshot } from './fixtures';
import {
  INVITE_LEDGER_CORES_PER_INVITE,
  INVITE_LEDGER_PLUS_DAYS_PER_INVITE,
  INVITE_LEDGER_RECENT_JOINS_DAYS,
} from './types';
import type {
  InviteLedgerRow,
  InviteLedgerRowStatus,
  InviteLedgerSnapshot,
} from './types';

export type { InviteLedgerRow, InviteLedgerRowStatus, InviteLedgerSnapshot };
export {
  INVITE_LEDGER_CORES_PER_INVITE,
  INVITE_LEDGER_PLUS_DAYS_PER_INVITE,
  INVITE_LEDGER_RECENT_JOINS_DAYS,
};

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

  const [demoMode, setDemoMode] = useState(getInviteLedgerDemoMode());
  useEffect(() => {
    setDemoMode(getInviteLedgerDemoMode());
    const onChange = () => setDemoMode(getInviteLedgerDemoMode());
    window.addEventListener('invite-ledger:demo-mode-change', onChange);
    return () =>
      window.removeEventListener('invite-ledger:demo-mode-change', onChange);
  }, []);

  const demoSnapshot = useMemo(
    () => (demoMode ? getDemoSnapshot(demoMode) : null),
    [demoMode],
  );

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

  if (demoSnapshot) {
    return demoSnapshot;
  }

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
