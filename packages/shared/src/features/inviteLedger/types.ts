import type { UserShortProfile } from '../../lib/user';

export const INVITE_LEDGER_CORES_PER_INVITE = 200;
export const INVITE_LEDGER_PLUS_DAYS_PER_INVITE = 7;
export const INVITE_LEDGER_RECENT_JOINS_DAYS = 7;

export type InviteLedgerRowStatus = 'joined' | 'pending' | 'expired';

export interface InviteLedgerRow {
  user: UserShortProfile;
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
  newsCohortKey: string;
}
