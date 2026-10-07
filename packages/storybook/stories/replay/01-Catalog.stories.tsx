import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  Callout,
  CalloutTone,
  CategoryChip,
  Mono,
  Page,
  PageHeader,
  Section,
  StatusChip,
  Table,
  TierChip,
} from './shell';
import type { Candidate } from './catalog';
import {
  annualFlagships,
  Cadence,
  Category,
  catalog,
  Status,
} from './catalog';

const meta: Meta = {
  title: 'Replay/01. Catalog',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every win moment the engine knows how to find, mapped to the field it comes from.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const rowsFor = (items: Candidate[]) =>
  items.map((candidate) => [
    <Mono>{candidate.id}</Mono>,
    <CategoryChip category={candidate.category} />,
    <span className="text-text-primary">{candidate.headline}</span>,
    <span className="flex flex-wrap gap-1">
      {candidate.mechanics.map((mechanic) => (
        <span
          key={mechanic}
          className="whitespace-nowrap rounded-6 bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption2"
        >
          {mechanic}
        </span>
      ))}
    </span>,
    <span className="font-mono text-text-quaternary typo-caption2">
      {candidate.source}
    </span>,
    <TierChip tier={candidate.tier} />,
    <StatusChip status={candidate.status} />,
  ]);

const HEAD = [
  'id',
  'Category',
  'What the frame says',
  'Mechanics',
  'Source',
  'Tier',
  'Status',
];

const countBy = <T extends string>(
  items: Candidate[],
  pick: (candidate: Candidate) => T,
): Record<string, number> =>
  items.reduce(
    (acc, candidate) => ({
      ...acc,
      [pick(candidate)]: (acc[pick(candidate)] ?? 0) + 1,
    }),
    {} as Record<string, number>,
  );

export const Catalog: Story = {
  render: () => {
    const byStatus = countBy(catalog, (candidate) => candidate.status);
    const byCategory = countBy(catalog, (candidate) => candidate.category);
    const weekly = catalog.filter((candidate) =>
      candidate.cadences.includes(Cadence.Weekly),
    );

    return (
      <Page>
        <PageHeader
          eyebrow="Replay"
          title={`${catalog.length} candidates, eight seats`}
        >
          <p>
            Every row names the field it reads. A candidate that cannot name its
            source does not belong in the catalog, because the point of this
            table is to be arguable: you can tell me a frame is wrong before
            anyone builds it.
          </p>
          <p>
            <strong className="text-text-primary">
              {byStatus[Status.Now] ?? 0} of {catalog.length} ship with no
              backend work at all.
            </strong>{' '}
            The weekly-native queries — <Mono>userReadHistory</Mono> and{' '}
            <Mono>userMostReadTags</Mono> — already take an arbitrary{' '}
            <Mono>after</Mono> and <Mono>before</Mono>, and{' '}
            <Mono>topReaderBadge</Mono>, <Mono>trackedAchievement</Mono>,{' '}
            <Mono>leaderboardPosition</Mono> and <Mono>userAchievements</Mono>{' '}
            are all live today.
          </p>
        </PageHeader>

        <Section title="Composition at a glance">
          <div className="grid gap-4 tablet:grid-cols-4">
            {Object.values(Category).map((category) => (
              <div
                key={category}
                className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
              >
                <span className="typo-mega3">{byCategory[category] ?? 0}</span>
                <CategoryChip category={category} />
              </div>
            ))}
          </div>
          <Callout tone={CalloutTone.Good} title="The spread is deliberate">
            Surprise and Crown carry the most candidates because they are the two
            that get shared. Community is the thinnest and the most valuable: it
            is the only category that buys a loop rather than reach, and three of
            its five entries are still blocked on an API.
          </Callout>
        </Section>

        <Section
          title="Weekly catalog"
          description={`${weekly.length} candidates eligible for the weekly cadence, including the guaranteed frames that make "always render" survivable.`}
        >
          <Table head={HEAD} rows={rowsFor(weekly)} minWidth={78} />
        </Section>

        <Section
          title="Annual flagships"
          description="Ported from the earlier viral-artifact exploration. They are catalog entries with a different cadence, not a separate feature, and they are where the loop mechanics live once the connection graph exists."
        >
          <Table head={HEAD} rows={rowsFor(annualFlagships)} minWidth={78} />
        </Section>

        <Section title="What is actually blocked">
          <Table
            head={['Gap', 'Unblocks', 'Shape of the fix']}
            minWidth={52}
            rows={[
              [
                'Weekly deltas on lifetime counters',
                <Mono>reception.followers, xp.earned</Mono>,
                'A per-window snapshot row. userStats and userPostsAnalytics are lifetime totals with no date arguments.',
              ],
              [
                'Date-filtered Cores transactions',
                <Mono>reception.awards</Mono>,
                'An after/before on the njord transaction query.',
              ],
              [
                'Comment analytics in a window',
                <Mono>reception.comment</Mono>,
                'Comment upvotes are on the comment; the window aggregate is not exposed.',
              ],
              [
                'Feed impressions per user',
                <Mono>selectivity</Mono>,
                'How many posts reached them, not how many they read. It turns a bare count of reads into a choice: 1,412 reached you, you picked 47.',
              ],
              [
                'Connection graph',
                <Mono>community.circle, community.squad, annual.devCircle</Mono>,
                'Who reads whom. Already scoped by the viral exploration.',
              ],
            ]}
          />
        </Section>
      </Page>
    );
  },
};
