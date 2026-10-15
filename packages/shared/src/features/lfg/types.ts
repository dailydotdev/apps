import type { UserShortProfile } from '../../lib/user';

export enum LfgKind {
  Build = 'build',
  Learn = 'learn',
  Help = 'help',
}

export enum LfgCommitment {
  OneCall = 'one_call',
  FewWeeks = 'few_weeks',
  Ongoing = 'ongoing',
}

export enum LfgPostStatus {
  Open = 'open',
  Found = 'found',
  Expired = 'expired',
}

export enum LfgAskType {
  Link = 'link',
  Text = 'text',
}

export enum LfgReachOutStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  // Its sender reads it as pending.
  Declined = 'declined',
  // The author marked the post found while it was still pending.
  Filled = 'filled',
}

// A question every reach-out to the post answers. The presets live here, so
// the post keeps a snapshot of the ones it asks.
export type LfgAsk = {
  id: string;
  label: string;
  type: LfgAskType;
};

// What a post or a reach-out shows of a person: the facts that come with
// them, verified or not.
export type LfgPerson = Pick<
  UserShortProfile,
  | 'id'
  | 'name'
  | 'username'
  | 'image'
  | 'permalink'
  | 'reputation'
  | 'bio'
  | 'createdAt'
  | 'companies'
> & {
  verifiedGithub?: string | null;
  experienceYears?: number | null;
  lfgKind?: LfgKind | null;
};

export type LfgMyReachOut = {
  id: string;
  status: LfgReachOutStatus;
  createdAt: string;
};

export type LfgPost = {
  id: string;
  author: LfgPerson;
  kind: LfgKind;
  commitment: LfgCommitment;
  showCountry: boolean;
  country: string | null;
  // The author's current UTC offset in hours, what the board filters by.
  utcOffset: number | null;
  title: string;
  body: string;
  tags: string[];
  asks: LfgAsk[];
  status: LfgPostStatus;
  isPaused: boolean;
  // Only the author sees these.
  pendingCount: number | null;
  acceptedCount: number | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  myReachOut: LfgMyReachOut | null;
};

export type LfgPostInput = Pick<
  LfgPost,
  'kind' | 'commitment' | 'showCountry' | 'title' | 'body' | 'tags' | 'asks'
>;

export type LfgBoardFilters = {
  kind?: LfgKind;
  tags: string[];
  timezones: number[];
  minReputation: number;
};

export type LfgBoardFacets = {
  timezones: number[];
  tags: string[];
};

export type LfgReachOutAnswer = {
  askId: string;
  value: string;
  verified: boolean;
};

export type LfgReachOut = {
  id: string;
  post: Pick<LfgPost, 'id' | 'title' | 'kind' | 'asks'>;
  sender: LfgPerson;
  pitch: string;
  answers: LfgReachOutAnswer[];
  status: LfgReachOutStatus;
  // Looked like spam, so it's in the filtered folder. Null for the sender.
  filtered: boolean | null;
  createdAt: string;
};

export type LfgReachOutInput = {
  postId: string;
  pitch: string;
  answers: Pick<LfgReachOutAnswer, 'askId' | 'value'>[];
};

export type LfgHelper = {
  tags: string[];
  perMonth: number;
  // Empty hears from every time zone.
  timezones: number[];
  minReputation: number;
};
