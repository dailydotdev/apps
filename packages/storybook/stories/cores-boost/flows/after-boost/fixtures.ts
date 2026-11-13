import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import {
  CampaignState,
  CampaignType,
} from '@dailydotdev/shared/src/graphql/campaigns';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { boostablePost } from '../../real/screens';
import { viewer } from '../../real/providers';

// Campaigns in the `CampaignFragment` shape. `flags.budget` is the total
// budget, as `CampaignListView` reads it ("2,000 | 1 day").

const oneDay = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number): Date =>
  new Date(Date.now() + days * oneDay);

const postNamed = (id: string, title: string): Post =>
  ({ ...boostablePost, id, title }) as Post;

const campaign = (
  id: string,
  post: Post,
  fields: Pick<Campaign, 'state' | 'createdAt' | 'endedAt' | 'flags'>,
): Campaign => ({
  id,
  referenceId: post.id,
  type: CampaignType.Post,
  post,
  user: viewer as LoggedUser,
  ...fields,
});

export const ciPost = boostablePost;

/** Started 2 days ago, 5 days long: 800 of 2,000 spent, 1,200 left to refund */
export const liveCampaign = campaign(
  'sb-campaign-live',
  postNamed('sb-post-bun', 'Why we moved our monorepo from Node to Bun'),
  {
    state: CampaignState.Active,
    createdAt: daysFromNow(-2),
    endedAt: daysFromNow(3),
    flags: {
      budget: 2000,
      spend: 800,
      impressions: 2400,
      users: 1500,
      clicks: 96,
    },
  },
);

/** The first boost from the First boost flow: 1 day, 2,000 Cores, 300 unspent */
export const endedCampaign = campaign('sb-campaign-ci', ciPost, {
  state: CampaignState.Completed,
  createdAt: daysFromNow(-1),
  endedAt: daysFromNow(0),
  flags: {
    budget: 2000,
    spend: 1700,
    impressions: 5700,
    users: 3500,
    clicks: 212,
  },
});

export const endedCampaigns: Campaign[] = [
  endedCampaign,
  campaign(
    'sb-campaign-2',
    postNamed('sb-post-rsc', 'React Server Components, one year in production'),
    {
      state: CampaignState.Completed,
      createdAt: daysFromNow(-24),
      endedAt: daysFromNow(-17),
      flags: {
        budget: 35000,
        spend: 35000,
        impressions: 61000,
        users: 38000,
        clicks: 1900,
      },
    },
  ),
  campaign(
    'sb-campaign-3',
    postNamed('sb-post-pg', 'Postgres indexes I wish I knew about sooner'),
    {
      state: CampaignState.Cancelled,
      createdAt: daysFromNow(-40),
      endedAt: daysFromNow(-38),
      flags: {
        budget: 10000,
        spend: 4100,
        impressions: 7200,
        users: 4600,
        clicks: 240,
      },
    },
  ),
  campaign(
    'sb-campaign-4',
    postNamed('sb-post-ts', 'TypeScript 6: what actually changes for you'),
    {
      state: CampaignState.Completed,
      createdAt: daysFromNow(-71),
      endedAt: daysFromNow(-66),
      flags: {
        budget: 25000,
        spend: 25000,
        impressions: 44000,
        users: 27000,
        clicks: 1300,
      },
    },
  ),
];

export const allCampaigns = [liveCampaign, ...endedCampaigns];

/** What `userCampaignStats` returns: totals over every campaign */
export const campaignTotals = allCampaigns.reduce(
  (totals, { flags }) => ({
    spend: totals.spend + (flags.spend ?? 0),
    impressions: totals.impressions + (flags.impressions ?? 0),
    users: totals.users + (flags.users ?? 0),
    clicks: totals.clicks + (flags.clicks ?? 0),
  }),
  { spend: 0, impressions: 0, users: 0, clicks: 0 },
);

export const unspentOf = ({ flags }: Campaign): number =>
  Math.max(0, (flags.budget ?? 0) - (flags.spend ?? 0));

export const durationOf = ({ createdAt, endedAt }: Campaign): number =>
  Math.max(
    1,
    Math.round(
      (new Date(endedAt).getTime() - new Date(createdAt).getTime()) / oneDay,
    ),
  );
