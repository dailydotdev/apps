import { addDays, addMinutes, subDays, subHours } from 'date-fns';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { SquadFreeBoost } from '@dailydotdev/shared/src/graphql/squadFreeBoost';
import { SquadFreeBoostStatus } from '@dailydotdev/shared/src/graphql/squadFreeBoost';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import { entries, toPost } from '../data';

// One company page, CodeRabbit, at each point of a founder's first weeks on
// the free tier, plus the cases where nothing admin-only shows. Every number
// on the page (the card, the panel, the header, the feed card, the right
// column) comes from the same scenario so they agree. Sample numbers: $100 at
// the top markets' rate buys about 9,500 impressions in a day.

export type Viewer = 'admin' | 'member' | 'visitor';

export interface PostStats {
  impressions: number;
  reach: number;
  clicks: number;
  bookmarks: number;
  squadJoins: number;
  upvotes: number;
  comments: number;
}

export interface Scenario {
  viewer: Viewer;
  /** Days since the page was created */
  pageAgeDays: number;
  plan: SquadPlan | null;
  /** The one trial intel ended, so the page reads the general trends */
  trialEnded?: boolean;
  /** Posts on the page, newest first */
  posts: { entry: number; hoursAgo: number; stats: PostStats }[];
  freeBoost: SquadFreeBoost | null;
  /** What the page has; everything when unset */
  page?: { logo: boolean; website: boolean; cover: boolean };
  /** The admin's own profile; all filled in when unset */
  profile?: Partial<Record<'photo' | 'headline' | 'job', boolean>>;
  /** The admin finishes the page and profile this long after it opens */
  finishSetupAfterMs?: number;
}

const BUDGET = 10_000;

const zero: PostStats = {
  impressions: 0,
  reach: 0,
  clicks: 0,
  bookmarks: 0,
  squadJoins: 0,
  upvotes: 0,
  comments: 0,
};

const boostDay: PostStats = {
  impressions: 5940,
  reach: 2480,
  clicks: 41,
  bookmarks: 7,
  squadJoins: 7,
  upvotes: 23,
  comments: 4,
};

const boostDone: PostStats = {
  impressions: 9420,
  reach: 3910,
  clicks: 68,
  bookmarks: 12,
  squadJoins: 9,
  upvotes: 38,
  comments: 6,
};

const organicPost: PostStats = {
  impressions: 140,
  reach: 120,
  clicks: 2,
  bookmarks: 1,
  squadJoins: 1,
  upvotes: 3,
  comments: 0,
};

const now = (): Date => new Date();

const boostedPost = (index = 0) => {
  const post = toPost(entries[index]);

  return {
    id: post.id,
    title: post.title ?? '',
    image: '/squad-page/coderabbit-banner.jpg',
    commentsPermalink: post.commentsPermalink ?? '#',
  };
};

const campaign = ({
  startedHoursAgo,
  spend,
}: {
  startedHoursAgo: number;
  spend: number;
}): SquadFreeBoost['campaign'] => {
  const createdAt = subHours(now(), startedHoursAgo);

  return {
    budget: BUDGET,
    spend,
    createdAt: createdAt.toISOString(),
    endedAt: addDays(createdAt, 1).toISOString(),
  };
};

const available = (pageAgeDays: number): SquadFreeBoost => ({
  status: SquadFreeBoostStatus.Available,
  availableUntil: addDays(subDays(now(), pageAgeDays), 30).toISOString(),
  post: null,
  campaign: null,
});

const setup = (pageAgeDays: number): SquadFreeBoost => ({
  ...available(pageAgeDays),
  status: SquadFreeBoostStatus.Setup,
});

const newFounder = { photo: false, headline: false, job: false };

export const scenarios = {
  /** Minutes after sign-up: no logo, no website, nothing posted */
  newPage: {
    viewer: 'admin',
    pageAgeDays: 0,
    plan: null,
    posts: [],
    freeBoost: setup(0),
    page: { logo: false, website: false, cover: false },
    profile: newFounder,
  },
  /** The page is ready for its boost, nothing posted yet */
  readyNoPost: {
    viewer: 'admin',
    pageAgeDays: 1,
    plan: null,
    posts: [],
    freeBoost: available(1),
    page: { logo: true, website: true, cover: false },
    profile: { photo: true, headline: false, job: false },
  },
  /** A week later, the one trial intel over and still nothing posted */
  trialEnded: {
    viewer: 'admin',
    pageAgeDays: 8,
    plan: null,
    trialEnded: true,
    posts: [],
    freeBoost: available(8),
    page: { logo: true, website: true, cover: false },
    profile: { photo: true, headline: false, job: false },
  },
  /** On Starter, nothing posted yet: the weekly intel without a trial */
  paidNoPost: {
    viewer: 'admin',
    pageAgeDays: 3,
    plan: SquadPlan.Starter,
    posts: [],
    freeBoost: {
      status: SquadFreeBoostStatus.Unavailable,
      availableUntil: null,
      post: null,
      campaign: null,
    },
    page: { logo: true, website: true, cover: true },
  },
  /** The admin fills in the last rows while the page is open */
  setupDone: {
    viewer: 'admin',
    pageAgeDays: 1,
    plan: null,
    posts: [],
    freeBoost: available(1),
    page: { logo: true, website: true, cover: false },
    profile: { photo: true, headline: true, job: true },
    finishSetupAfterMs: 1500,
  },
  /** Mid-day: the numbers climb every 5 minutes */
  boostLive: {
    viewer: 'admin',
    pageAgeDays: 0,
    plan: null,
    posts: [{ entry: 0, hoursAgo: 15, stats: boostDay }],
    freeBoost: {
      ...available(0),
      status: SquadFreeBoostStatus.Active,
      post: boostedPost(),
      campaign: campaign({ startedHoursAgo: 15, spend: 6300 }),
    },
  },
  /** Free page after the boost: the value panel and its one offer */
  afterBoost: {
    viewer: 'admin',
    pageAgeDays: 10,
    plan: null,
    posts: [
      { entry: 2, hoursAgo: 30, stats: organicPost },
      {
        entry: 3,
        hoursAgo: 100,
        stats: { ...organicPost, impressions: 310, reach: 260, clicks: 4 },
      },
      { entry: 0, hoursAgo: 9 * 24, stats: boostDone },
    ],
    freeBoost: {
      ...available(10),
      status: SquadFreeBoostStatus.Completed,
      post: boostedPost(),
      campaign: campaign({ startedHoursAgo: 9 * 24, spend: BUDGET }),
    },
  },
  /** On Starter: no free boost card, no offer */
  paidPage: {
    viewer: 'admin',
    pageAgeDays: 40,
    plan: SquadPlan.Starter,
    posts: [
      {
        entry: 2,
        hoursAgo: 20,
        stats: { ...boostDone, impressions: 4200, reach: 2900 },
      },
      { entry: 0, hoursAgo: 30 * 24, stats: boostDone },
    ],
    freeBoost: {
      status: SquadFreeBoostStatus.Unavailable,
      availableUntil: null,
      post: null,
      campaign: null,
    },
  },
} satisfies Record<string, Scenario>;

export type ScenarioName = keyof typeof scenarios;

export const sumStats = (scenario: Scenario): PostStats =>
  scenario.posts.reduce<PostStats>(
    (total, { stats }) => ({
      impressions: total.impressions + stats.impressions,
      reach: total.reach + stats.reach,
      clicks: total.clicks + stats.clicks,
      bookmarks: total.bookmarks + stats.bookmarks,
      squadJoins: total.squadJoins + stats.squadJoins,
      upvotes: total.upvotes + stats.upvotes,
      comments: total.comments + stats.comments,
    }),
    zero,
  );

export const scenarioPosts = (
  scenario: Scenario,
  source: Post['source'],
): Post[] =>
  scenario.posts.map(({ entry, hoursAgo, stats }) => ({
    ...toPost(entries[entry]),
    image: '/squad-page/coderabbit-banner.jpg',
    createdAt: addMinutes(now(), -hoursAgo * 60).toISOString(),
    pinnedAt: undefined,
    numUpvotes: stats.upvotes,
    numComments: stats.comments,
    numAwards: 0,
    source,
  }));
