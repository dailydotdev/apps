import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { LockIcon } from '@dailydotdev/shared/src/components/icons/Lock';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { agentViewsVendorSeries } from '@dailydotdev/shared/src/components/analytics/agentViews';
import { MonthlyCredits } from '@dailydotdev/shared/src/features/squads/components/promos/StartupsPromo';
import {
  StartupsPromoSpot,
  useStartupsPromo,
} from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { LeaderboardHeading } from '@dailydotdev/shared/src/features/leaderboard/LeaderboardRows';
import { getPostPath } from '@dailydotdev/shared/src/lib/links';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { Campaign } from '@dailydotdev/shared/src/graphql/campaigns';
import { CampaignState } from '@dailydotdev/shared/src/graphql/campaigns';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { ModalProps } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { allCampaigns, lastBoostOf } from '../../flows/after-boost/fixtures';
import { boostablePost } from '../../real/screens';
import type { Day, MetricDef } from './BoostAnalytics';
import {
  ChartColor,
  boostMetrics,
  dailySeries,
  lastDays,
  MetricsPanel,
  stickyCellClassName,
  stickyHeadClassName,
  tableScrollClassName,
} from './BoostAnalytics';
import {
  BoostsList,
  BoostsTab,
  DocsLinks,
  StopBoostPrompt,
} from './BoostsPage';
import { BoostAgainModal } from './BoostAgainModal';

// /analytics and Boost manager as one page with two header tabs, as Squads
// has Discover and My Squads. Analytics covers every post, boosted or not,
// with the boosted reach stacked on the organic in each chart; Boost lists
// only the boosts, with their numbers and actions. Production's post analytics
// additions come along: the limited reach note on a flagged post, and the AI
// agents section, locked behind the Startups plan.

export enum AnalyticsTab {
  Analytics = 'Analytics',
  Boost = 'Boost',
}

const counted =
  (key: string) =>
  (values: Record<string, number>): number =>
    values[key] ?? 0;

const organicMetrics: MetricDef[] = [
  {
    id: 'impressions',
    label: 'Impressions',
    info: 'How many times your posts appeared in front of a developer, without a boost.',
    of: counted('impressions'),
  },
  {
    id: 'upvotes',
    label: 'Upvotes',
    info: 'Upvotes cast on your posts during this period that still stand.',
    of: counted('upvotes'),
  },
  {
    id: 'comments',
    label: 'Comments',
    info: 'Comments left on your posts during this period.',
    of: counted('comments'),
  },
  {
    id: 'followers',
    label: 'New followers',
    info: 'Developers who started following you during this period.',
    of: counted('followers'),
  },
  {
    id: 'reputation',
    label: 'Reputation',
    info: 'Reputation you earned during this period.',
    of: counted('reputation'),
  },
];

/** Organic reach by day: a weekday rhythm with a little wobble */
const organicSeries = (): Day[] =>
  lastDays((date, index) => {
    const weekend = [0, 6].includes(date.getDay()) ? 0.6 : 1;
    const impressions =
      weekend * (22000 + 6000 * Math.abs(Math.sin(index * 1.3)));

    return {
      impressions,
      upvotes: impressions * 0.012,
      comments: impressions * 0.0018,
      followers: impressions * 0.0003,
      reputation: impressions * 0.0021,
    };
  });

const reachDocsUrl = 'https://docs.daily.dev/what-the-feed-recommends/';

/** Production's LimitedReachCard copy, by the reason the API sends */
export const limitedReach = {
  ai_written: {
    body: 'Developers here tend to skip posts that read as AI-written, so we expect limited reach for this one. Posts about what your team built, measured or got wrong usually go furthest.',
    anchor: 'ai-written',
  },
  promotional: {
    body: 'Developers come here to learn, and they tend to pass on posts that are mostly about a product, so we expect limited reach for this one. A how-to, a lesson learned or real numbers from building it usually does much better.',
    anchor: 'promotional',
  },
  oversold_title: {
    body: "Developers here notice when a title promises more than the post delivers, so we expect limited reach for this one. A title that says plainly what they'll learn gets more clicks and upvotes.",
    anchor: 'oversold-title',
  },
  language: {
    body: 'Most developers here read in English, so this post reaches only readers who chose its language.',
    anchor: 'language',
  },
};

export type LimitedReachReason = keyof typeof limitedReach;

/** A post someone wrote and never boosted */
const unboostedPost = (id: string, title: string): Post =>
  ({ ...boostablePost, id, title }) as Post;

interface PostRow {
  post: Post;
  impressions: number;
  upvotes: number;
  comments: number;
  isBoosted: boolean;
  limitedReachReason?: LimitedReachReason;
}

/** The posts production flagged, by the reason it gives */
const flaggedPosts: Record<string, LimitedReachReason> = {
  'sb-post-git': 'oversold_title',
  'sb-post-css': 'promotional',
};

/** Every post, boosted or not, with its organic numbers */
const postRows = (campaigns: Campaign[]): PostRow[] => {
  const boosted = campaigns.map(({ post }) => post as Post);
  const posts = [
    unboostedPost('sb-post-edge', 'Edge functions are not a free lunch'),
    ...boosted,
    unboostedPost('sb-post-css', 'Container queries finally clicked for me'),
    unboostedPost('sb-post-git', 'The git commands I use every single day'),
  ];

  return posts.map((post, index) => {
    const reach = Math.abs(Math.sin(index * 2.7 + 0.4));
    const impressions = 3000 + 26000 * reach * reach;
    const engagement = 0.008 + 0.009 * Math.abs(Math.cos(index * 1.9));

    return {
      post,
      impressions,
      upvotes: impressions * engagement,
      comments: impressions * engagement * 0.16,
      isBoosted: boosted.includes(post),
      limitedReachReason: flaggedPosts[post.id],
    };
  });
};

const cardClassName =
  'flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary';

const chipClassName = (color: string): string =>
  classNames(
    'flex items-center gap-0.5 rounded-6 px-1.5 typo-caption2 hover:underline',
    color,
  );

/** A boosted post's chip, which opens the Boost tab */
export const BoostedChip = ({
  onClick,
}: {
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className={chipClassName(
      'bg-overlay-float-blueCheese text-accent-blueCheese-default',
    )}
  >
    <BoostIcon size={IconSize.Size16} />
    Boosted
  </button>
);

/** A flagged post's chip: the note on hover, the docs on click */
export const LimitedReachChip = ({
  reason,
}: {
  reason: LimitedReachReason;
}): ReactElement => (
  <Tooltip className="max-w-70" content={limitedReach[reason].body}>
    <a
      href={`${reachDocsUrl}#${limitedReach[reason].anchor}`}
      target="_blank"
      rel={anchorDefaultRel}
      className={chipClassName('bg-overlay-float-bun text-accent-bun-default')}
    >
      Limited reach
    </a>
  </Tooltip>
);

const columns = ['Post', 'Impressions', 'Upvotes', 'Comments'];

/** Every post with its organic numbers; a boosted one links to its boost */
const PostsTable = ({
  rows,
  onShowBoosts,
}: {
  rows: PostRow[];
  onShowBoosts: () => void;
}): ReactElement => (
  <div className={tableScrollClassName}>
    <table className="w-full table-auto border-collapse text-left">
      <thead>
        <tr className="border-b border-border-subtlest-tertiary bg-surface-float">
          {columns.map((column, index) => (
            <th
              key={column}
              scope="col"
              className={classNames(
                'whitespace-nowrap px-3 py-2 font-bold uppercase tracking-wider text-text-tertiary typo-caption2',
                index === 0
                  ? classNames(stickyHeadClassName, 'w-full pl-4 tablet:pl-6')
                  : 'text-right',
                index === columns.length - 1 && 'pr-4 tablet:pr-6',
              )}
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(
          ({
            post,
            impressions,
            upvotes,
            comments,
            isBoosted,
            limitedReachReason,
          }) => (
            <tr
              key={post.id}
              className="group border-b border-border-subtlest-tertiary transition-colors last:border-b-0 hover:bg-surface-hover"
            >
              <td
                className={classNames(
                  stickyCellClassName,
                  'max-w-0 py-3 pl-4 pr-3 tablet:pl-6',
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Image
                    src={post.image}
                    alt=""
                    className="hidden h-8 w-12 shrink-0 rounded-8 object-cover tablet:block"
                  />
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                    <Link href={getPostPath(post)} passHref>
                      <a className="line-clamp-2 max-w-full font-bold typo-footnote hover:underline tablet:truncate">
                        {post.title}
                      </a>
                    </Link>
                    {(isBoosted || limitedReachReason) && (
                      <span className="flex flex-wrap gap-1">
                        {isBoosted && <BoostedChip onClick={onShowBoosts} />}
                        {limitedReachReason && (
                          <LimitedReachChip reason={limitedReachReason} />
                        )}
                      </span>
                    )}
                  </span>
                </span>
              </td>
              <td className="px-3 py-3 text-right tabular-nums typo-footnote">
                {largeNumberFormat(Math.round(impressions))}
              </td>
              <td className="px-3 py-3 text-right tabular-nums typo-footnote">
                {largeNumberFormat(Math.round(upvotes))}
              </td>
              <td className="py-3 pl-3 pr-4 text-right tabular-nums typo-footnote tablet:pr-6">
                {largeNumberFormat(Math.round(comments))}
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  </div>
);

/** The boosts' reach in the organic metrics' terms, to stack on top of them */
const boostedSeries = (campaigns: Campaign[]): Day[] =>
  dailySeries(campaigns).map(({ date, values }) => ({
    date,
    values: {
      impressions: values.impressions,
      upvotes: values.impressions * 0.009,
      comments: values.impressions * 0.0012,
      followers: values.impressions * 0.0005,
      reputation: values.impressions * 0.0016,
    },
  }));

const agentMetrics: MetricDef[] = [
  {
    id: 'reads',
    label: 'AI agent reads',
    info: 'Times an AI agent read one of your posts to answer someone.',
    of: counted('reads'),
  },
  {
    id: 'crawls',
    label: 'AI crawler visits',
    info: 'Times an AI crawler visited one of your posts.',
    of: counted('crawls'),
  },
];

// Made-up numbers: the chart only shows blurred, behind the plan
const agentSeries = (): Day[] =>
  lastDays((_, index) => ({
    reads: 60 + 30 * Math.sin(index / 2) + index * 4,
    crawls: 190 + 70 * Math.sin(index / 3 + 1) + index * 9,
  }));

const agentNames = agentViewsVendorSeries
  .slice(0, 4)
  .map(({ label }) => label)
  .join(', ');

const previewVeil =
  'radial-gradient(70% 70% at 50% 50%, color-mix(in srgb, var(--theme-background-default) 85%, transparent) 0%, color-mix(in srgb, var(--theme-background-default) 40%, transparent) 100%)';

/** The AI agents chart, open on a Startups plan */
const AgentsPanel = (): ReactElement => {
  const days = useMemo(agentSeries, []);

  return (
    <div className={cardClassName}>
      <MetricsPanel
        metrics={agentMetrics}
        days={days}
        color={ChartColor.Agents}
        className=""
      />
    </div>
  );
};

/** Production's StartupsAgentAnalyticsPromo, over this page's own chart */
const AgentsTeaser = (): ReactElement => {
  const promo = useStartupsPromo({ spot: StartupsPromoSpot.AdsDashboard });
  const days = useMemo(agentSeries, []);

  return (
    <div className={classNames(cardClassName, 'relative')}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none overflow-hidden blur-sm"
      >
        <MetricsPanel
          metrics={agentMetrics}
          days={days}
          color={ChartColor.Agents}
          className=""
        />
      </div>
      <div
        className="relative flex min-h-80 flex-col items-center justify-center gap-3 px-6 py-12 text-center"
        style={{ background: previewVeil }}
      >
        <span className="flex size-10 items-center justify-center rounded-12 bg-overlay-float-cabbage text-accent-cabbage-default">
          <LockIcon size={IconSize.Medium} />
        </span>
        <h3 className="font-bold typo-body">
          See which AI agents read your posts
        </h3>
        <p className="max-w-md text-text-secondary typo-callout">
          {`${agentNames} read posts on daily.dev when someone asks them about a topic. Get a company page for ${promo.starterPrice} a month to see every read and crawl, day by day, with `}
          <MonthlyCredits promo={promo} /> every month.
        </p>
        <Button
          tag="a"
          href={promo.checkoutUrl}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={promo.onClick}
        >
          See plans
        </Button>
      </div>
    </div>
  );
};

interface CombinedAnalyticsProps {
  campaigns?: Campaign[];
  initialTab?: AnalyticsTab;
  /** A Startups plan opens the AI agents chart */
  hasStartupsPlan?: boolean;
  /** The Analytics chart's opening metric */
  initialMetric?: string;
  /** The Analytics chart's layers that open muted */
  initialHidden?: string[];
  /** The Boost tab's list opens on Live or Ended */
  initialBoostsTab?: BoostsTab;
  /** The charts' numbers are still on the way */
  isLoading?: boolean;
  /** Where Boost again's pop-up opens, for a page inside a device frame */
  modalProps?: Pick<ModalProps, 'parentSelector' | 'bodyOpenClassName'>;
}

export function CombinedAnalytics({
  campaigns: initialCampaigns = allCampaigns,
  initialTab = AnalyticsTab.Analytics,
  hasStartupsPlan = false,
  initialMetric,
  initialHidden,
  initialBoostsTab,
  isLoading,
  modalProps,
}: CombinedAnalyticsProps): ReactElement {
  const [tab, setTab] = useState(initialTab);
  // Stopping a boost moves it to Ended, as production's cancel does
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [stopping, setStopping] = useState<Campaign>();
  // An ended boost's Boost again opens the form, prefilled with its budget
  const [boostingAgain, setBoostingAgain] = useState<Campaign>();
  // Nothing boosted yet: organic alone, so no legend
  const layers = useMemo(
    () => [
      { label: 'Organic', color: ChartColor.Organic, days: organicSeries() },
      ...(campaigns.length
        ? [
            {
              label: 'Boosted',
              color: ChartColor.Boosted,
              days: boostedSeries(campaigns),
            },
          ]
        : []),
    ],
    [campaigns],
  );
  const boostDays = useMemo(() => dailySeries(campaigns), [campaigns]);
  const rows = useMemo(() => postRows(campaigns), [campaigns]);
  const isBoost = tab === AnalyticsTab.Boost;

  return (
    <>
      <header className={classNames(pageHeaderClassName, 'gap-4 !py-0')}>
        <SquadDirectoryNavbar
          aria-label="Analytics and Boost"
          className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
        >
          {Object.values(AnalyticsTab).map((name) => (
            <SquadDirectoryNavbarItem
              key={name}
              buttonSize={ButtonSize.Small}
              isActive={tab === name}
              label={name}
              onClick={() => setTab(name)}
            />
          ))}
        </SquadDirectoryNavbar>
        {isBoost && (
          <div className="flex shrink-0 items-center gap-1 py-2">
            <DocsLinks />
          </div>
        )}
      </header>
      <PageWrapperLayout className="flex flex-col gap-8 px-4 pb-6 pt-3 tablet:gap-10">
        {(!isBoost || !!campaigns.length) && (
          <div className={cardClassName}>
            {isBoost ? (
              <MetricsPanel
                key={tab}
                metrics={boostMetrics}
                days={boostDays}
                className=""
                isLoading={isLoading}
              />
            ) : (
              <MetricsPanel
                key={tab}
                metrics={organicMetrics}
                layers={layers}
                className=""
                initialMetric={initialMetric}
                initialHidden={initialHidden}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
        <section className="flex flex-col gap-4">
          <LeaderboardHeading title={isBoost ? 'Your boosts' : 'Your posts'} />
          <div className={cardClassName}>
            {isBoost ? (
              <BoostsList
                campaigns={campaigns}
                initialTab={initialBoostsTab}
                onBoostAgain={setBoostingAgain}
                onStop={setStopping}
              />
            ) : (
              <PostsTable
                rows={rows}
                onShowBoosts={() => setTab(AnalyticsTab.Boost)}
              />
            )}
          </div>
        </section>
        {!isBoost && (
          <section className="flex flex-col gap-4">
            <LeaderboardHeading title="AI agents" />
            {hasStartupsPlan ? <AgentsPanel /> : <AgentsTeaser />}
          </section>
        )}
      </PageWrapperLayout>
      {stopping && (
        <StopBoostPrompt
          modalProps={modalProps}
          onRequestClose={() => setStopping(undefined)}
          onStop={() => {
            setCampaigns((list) =>
              list.map((item) =>
                item.id === stopping.id
                  ? {
                      ...item,
                      state: CampaignState.Cancelled,
                      endedAt: new Date(),
                    }
                  : item,
              ),
            );
            setStopping(undefined);
          }}
        />
      )}
      {boostingAgain && (
        <BoostAgainModal
          {...modalProps}
          isOpen
          post={boostingAgain.post as Post}
          lastBoost={lastBoostOf(boostingAgain)}
          onRequestClose={() => setBoostingAgain(undefined)}
          onSeeBoost={() => setBoostingAgain(undefined)}
        />
      )}
    </>
  );
}
