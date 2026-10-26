import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Case, Page } from '../parts';

const meta: Meta = {
  title: 'Hero Cover/Widgets/12. Launch candidates',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Candidate = {
  name: string;
  glance: string;
  source: string;
  backend: 'None' | 'New';
  flag?: string;
  score: 1 | 2 | 3 | 4 | 5;
  why: string;
};

/*
 * From a survey of the whole product for features that could become a
 * widget, beyond the ones already in the library. Every source is a real
 * component or query in the repo today.
 */
const candidates: Candidate[] = [
  {
    name: 'Next achievement',
    glance: 'A ring on the achievement you track: 7/10 upvotes',
    source: 'useTrackedAchievement, AchievementTrackingWidget',
    backend: 'None',
    flag: 'achievement_tracking_widget',
    score: 5,
    why: 'The classic home-screen ring, and a reason to come back daily.',
  },
  {
    name: 'Reputation and Cores',
    glance: 'Your reputation and Cores balance, tap for the wallet',
    source: 'Boot: user.reputation, user.balance',
    backend: 'None',
    flag: 'cores',
    score: 4,
    why: 'Free to build, always relevant, keeps Cores in sight.',
  },
  {
    name: 'Job matches',
    glance: '2 roles match you, or upload your CV',
    source: 'USER_OPPORTUNITY_MATCHES_QUERY, alerts.opportunityId',
    backend: 'None',
    flag: 'jobs_ui',
    score: 4,
    why: 'A business funnel, and personal matches feel valuable.',
  },
  {
    name: 'Leaderboard rank',
    glance: '#1,204 in longest streak, up 38 this week',
    source: 'LEADERBOARD_POSITION_QUERY',
    backend: 'None',
    score: 4,
    why: 'A competitive hook on a query that already exists.',
  },
  {
    name: 'Hot discussions',
    glance: 'The 3 most-discussed posts, with comment counts',
    source: 'MOST_DISCUSSED_FEED_QUERY',
    backend: 'None',
    score: 4,
    why: 'Pulls readers into comments, which no current widget does.',
  },
  {
    name: 'Profile views',
    glance: '38 views this week, +12%, with a sparkline',
    source: 'USER_PROFILE_ANALYTICS_QUERY',
    backend: 'None',
    score: 4,
    why: 'A vanity number with strong pull. Owner only.',
  },
  {
    name: 'Reading overview',
    glance: 'Posts read this week and your top tags',
    source: 'USER_READING_HISTORY_QUERY',
    backend: 'None',
    score: 4,
    why: 'Self-insight beyond the streak, and it can be shared.',
  },
  {
    name: 'Profile completion',
    glance: 'Profile 60% complete: add your stack',
    source: 'Boot: user.profileCompletion',
    backend: 'None',
    flag: 'profile_completion_card',
    score: 3,
    why: 'Better profiles for jobs; retires when complete. Pairs with Getting started.',
  },
  {
    name: 'Jump back in',
    glance: 'The squads, sources and profiles you visited last',
    source: 'useRecentPages (local)',
    backend: 'None',
    score: 3,
    why: 'Free, and different from Continue reading (pages, not posts).',
  },
  {
    name: 'Custom feeds',
    glance: 'Your custom feeds as chips, one tap to switch',
    source: 'FEED_LIST_QUERY',
    backend: 'None',
    score: 3,
    why: 'Power users love it; empty for most.',
  },
  {
    name: 'Referral ladder',
    glance: '2/5 invites to a month of Plus',
    source: 'REFERRAL_LADDER_QUERY',
    backend: 'None',
    score: 3,
    why: 'A growth lever with visible progress; overlaps campaign strips.',
  },
  {
    name: 'Recommended squads',
    glance: '2–3 squads to join, with Join',
    source: 'featuredSquadsQuery',
    backend: 'None',
    score: 3,
    why: 'Discovery, distinct from Squad updates.',
  },
  {
    name: 'Creator stats',
    glance: 'Your posts’ impressions and upvotes, 30 days',
    source: 'creatorPerformanceQueryOptions',
    backend: 'None',
    score: 3,
    why: 'Sticky for people who post, irrelevant for pure readers.',
  },
  {
    name: 'Top reader badge',
    glance: 'Top reader in #react this month',
    source: 'useTopReader, alerts.showTopReader',
    backend: 'None',
    score: 3,
    why: 'A proud moment, but monthly.',
  },
  {
    name: 'Looking for group',
    glance: 'Your open post, waiting reach-outs',
    source: 'LfgYourPostWidget, lfg queries',
    backend: 'None',
    flag: 'lfg, lfg_launched, direct_messages',
    score: 3,
    why: 'Widget pieces already exist; heavily gated.',
  },
  {
    name: 'Quick search',
    glance: 'A search box and your recent commands',
    source: 'Spotlight, useRecentCommands (local)',
    backend: 'None',
    score: 3,
    why: 'Useful, but the header already has search.',
  },
  {
    name: 'Poll of the day',
    glance: 'One live poll, vote in place',
    source: 'usePoll, votePoll',
    backend: 'New',
    score: 3,
    why: 'Very interactive; needs a poll-of-the-day query.',
  },
  {
    name: 'Trending tools',
    glance: '3 tools developers are adopting',
    source: 'TOP_TOOLS_QUERY',
    backend: 'None',
    score: 2,
    why: 'New surface, weak tie to daily use.',
  },
  {
    name: 'I’m feeling lucky',
    glance: 'One tap, one good post',
    source: 'LUCKY_POST_QUERY',
    backend: 'None',
    flag: 'lucky_button',
    score: 2,
    why: 'Fun, but a button more than a glance.',
  },
  {
    name: 'Top creators in your tag',
    glance: '3 people to follow for your top tag',
    source: 'TOP_CREATORS_BY_TAG_QUERY',
    backend: 'None',
    score: 2,
    why: 'Follow growth, mid-strength signal.',
  },
];

const tiers: { title: string; note: string; min: number; max: number }[] = [
  {
    title: 'Recommended for launch',
    note: 'High value and no backend work. Each reads data the client already has.',
    min: 4,
    max: 5,
  },
  {
    title: 'Next',
    note: 'Good, but narrower audiences, overlap with an existing widget, or a flag to clear.',
    min: 3,
    max: 3,
  },
  {
    title: 'Later',
    note: 'Low daily pull for the effort.',
    min: 1,
    max: 2,
  },
];

const Score = ({ score }: { score: number }): ReactElement => (
  <span className="flex gap-0.5" aria-label={`${score} of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        className={classNames(
          'size-2 rounded-max',
          n <= score ? 'bg-accent-cabbage-default' : 'bg-surface-float',
        )}
      />
    ))}
  </span>
);

const Table = ({ rows }: { rows: Candidate[] }): ReactElement => (
  <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full text-left typo-callout">
      <thead className="bg-surface-float text-text-tertiary typo-footnote">
        <tr>
          {['Widget', 'At a glance', 'Data', 'Backend', 'Value', 'Why'].map(
            (h) => (
              <th key={h} className="px-4 py-2 font-bold">
                {h}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.name}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            <td className="px-4 py-3 font-bold text-text-primary">
              {row.name}
              {row.flag && (
                <span className="mt-1 block font-normal text-text-quaternary typo-caption1">
                  flag: {row.flag}
                </span>
              )}
            </td>
            <td className="px-4 py-3 text-text-secondary">{row.glance}</td>
            <td className="px-4 py-3 font-mono text-text-tertiary typo-caption1">
              {row.source}
            </td>
            <td className="px-4 py-3">
              <span
                className={classNames(
                  'rounded-6 px-1.5 font-bold typo-caption1',
                  row.backend === 'None'
                    ? 'bg-accent-avocado-flat text-accent-avocado-default'
                    : 'bg-accent-bacon-flat text-accent-bacon-default',
                )}
              >
                {row.backend === 'None' ? 'None' : 'New API'}
              </span>
            </td>
            <td className="px-4 py-3">
              <Score score={row.score} />
            </td>
            <td className="px-4 py-3 text-text-tertiary">{row.why}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const LaunchCandidates: StoryObj = {
  name: '12. Launch candidates',
  render: () => (
    <Page
      chapter="Widgets · 12"
      question="What else in the product should be a widget at launch?"
      title="Launch candidates"
      goal="A ranked list of every product feature that could become a widget, beyond the library, with where its data comes from and what it would cost."
      metric="Widgets added per reader in the first month, and how many of the launch set stay on the rail after 30 days."
    >
      <Case
        title="What the launch set already covers"
        note="Top story, Happening now, Your agents, Claude Code, Notifications, Messages, Squad updates, Reading list, Streak and quests, the briefings, Podcast, Trending tags, Continue reading, From daily.dev, the ad slot, and now Weather, Shortcuts, Getting started and To-do."
      >
        <span />
      </Case>
      {tiers.map((tier) => (
        <Case key={tier.title} title={tier.title} note={tier.note}>
          <Table
            rows={candidates.filter(
              (c) => c.score >= tier.min && c.score <= tier.max,
            )}
          />
        </Case>
      ))}
      <Case
        title="Capabilities the rail itself needs before launch"
        note="Not widgets, but what makes the widgets work at scale."
      >
        <ul className="flex max-w-[56rem] list-disc flex-col gap-1.5 pl-5 text-text-secondary typo-callout">
          <li>
            Saving the reader’s rail (order, sizes, which widgets) to their
            account, so it follows them between the webapp and the extension.
          </li>
          <li>
            Per-widget settings: a city for Weather, a source for Shortcuts, a
            tag for Trending.
          </li>
          <li>
            A default rail per kind of reader (new, regular, Plus), so nobody
            starts from an empty rail.
          </li>
          <li>
            Impression and click logging per widget, so we can see which widgets
            earn their slot.
          </li>
          <li>
            A way for daily.dev to place a widget for everyone (Getting started
            for new readers, a campaign), with a cap so the rail stays theirs.
          </li>
        </ul>
      </Case>
    </Page>
  ),
};
