import type { UserShortProfile } from '../../lib/user';
import type { InviteLedgerDemoMode } from './debug';
import type { InviteLedgerRow, InviteLedgerSnapshot } from './types';
import {
  INVITE_LEDGER_CORES_PER_INVITE,
  INVITE_LEDGER_PLUS_DAYS_PER_INVITE,
} from './types';

const DEMO_INVITE_URL = 'https://api.daily.dev/get?r=demo';

const daysAgoIso = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const makeUser = (
  id: string,
  username: string,
  daysAgo: number,
): UserShortProfile => ({
  id,
  name: username,
  username,
  image: '',
  permalink: `https://app.daily.dev/${username}`,
  bio: undefined,
  createdAt: daysAgoIso(daysAgo),
  reputation: 0,
  companies: [],
  isPlus: false,
  plusMemberSince: undefined,
});

const makeRow = (
  id: string,
  username: string,
  daysAgo: number,
  status: InviteLedgerRow['status'] = 'joined',
): InviteLedgerRow => ({
  user: makeUser(id, username, daysAgo),
  status,
  coresToInviter: status === 'joined' ? INVITE_LEDGER_CORES_PER_INVITE : 0,
});

const FULL_ROWS: InviteLedgerRow[] = [
  makeRow('1', 'yael.dev', 2),
  makeRow('2', 'petraq', 4),
  makeRow('3', 'maya.k', 5, 'pending'),
  makeRow('4', 'k.menshikov', 10),
  makeRow('5', 'dpetrosyan', 12, 'pending'),
  makeRow('6', 'old.invite', 30, 'expired'),
  makeRow('7', 'orelyahav', 21),
  makeRow('8', 'nimrod.k', 28),
];

const SINGLE_ROWS: InviteLedgerRow[] = [makeRow('1', 'yael.dev', 1)];

const buildSnapshot = (
  rows: InviteLedgerRow[],
): Pick<
  InviteLedgerSnapshot,
  | 'invitesAccepted'
  | 'coresGiftedToFriends'
  | 'plusDaysGiftedToFriends'
  | 'coresEarned'
  | 'rows'
  | 'recentJoins'
  | 'hasNews'
  | 'newsCohortKey'
> => {
  const joined = rows.filter((r) => r.status === 'joined');
  const recent = joined.filter(
    (r) =>
      (Date.now() - new Date(r.user.createdAt).getTime()) /
        (24 * 60 * 60 * 1000) <=
      7,
  );
  return {
    invitesAccepted: joined.length,
    coresGiftedToFriends: joined.length * INVITE_LEDGER_CORES_PER_INVITE,
    plusDaysGiftedToFriends: joined.length * INVITE_LEDGER_PLUS_DAYS_PER_INVITE,
    coresEarned: joined.length * INVITE_LEDGER_CORES_PER_INVITE,
    rows,
    recentJoins: recent,
    hasNews: recent.length > 0,
    newsCohortKey: recent.map((r) => r.user.id).join(','),
  };
};

export const getDemoSnapshot = (
  mode: NonNullable<InviteLedgerDemoMode>,
): InviteLedgerSnapshot => {
  const base = {
    inviteUrl: DEMO_INVITE_URL,
    isLoading: false,
    fetchNextPage: async () => undefined,
    hasNextPage: false,
    isFetchingNextPage: false,
  };
  if (mode === 'empty') {
    return { ...base, ...buildSnapshot([]) };
  }
  if (mode === 'single') {
    return { ...base, ...buildSnapshot(SINGLE_ROWS) };
  }
  return { ...base, ...buildSnapshot(FULL_ROWS) };
};
