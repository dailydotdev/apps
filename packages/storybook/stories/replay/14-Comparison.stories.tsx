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
} from './shell';
import type { Candidate } from './catalog';
import {
  annualFlagships,
  Category,
  catalog,
  Comparison,
  Frequency,
  handoffFrame,
  Shareability,
} from './catalog';
import { FrameStyles, FrameThumb } from './frames';
import { sampleData } from './data';

const meta: Meta = {
  title: 'Replay/14. Metric and comparison',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every live card as one metric, one comparison and one cadence. The organising rule from the brief.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/** Only cards that can actually be dealt. */
const LIVE: Candidate[] = [...catalog, ...annualFlagships, handoffFrame].filter(
  (c) =>
    c.shareability !== Shareability.C && c.shareability !== Shareability.Cut,
);

const COMPARISON_LABEL: Record<Comparison, string> = {
  [Comparison.SelfVsPast]: 'C1 · me vs my own past',
  [Comparison.SelfVsAll]: 'C2 · me vs all developers',
  [Comparison.SelfVsPeers]: 'C3 · me vs my peers in a topic',
  [Comparison.SelfVsNamed]: 'C4 · me vs named people',
};

const COMPARISON_NOTE: Record<Comparison, string> = {
  [Comparison.SelfVsPast]:
    'The cheapest comparison and the one that always exists: 80% of actives were active last week. Reads as growth, which is flattering without needing a denominator.',
  [Comparison.SelfVsAll]:
    '"More than 88% of developers." The 83,853 weekly actives. Always available, and the strongest line we can say honestly today.',
  [Comparison.SelfVsPeers]:
    '"Top 4% of Kubernetes readers." Strongest driver, and the one that needs gates: 1,000 in the set, above p75 only, 109 tags qualify.',
  [Comparison.SelfVsNamed]:
    'Needs the connection graph. Nothing here ships until it exists.',
};

const FREQ_LABEL: Record<Frequency, string> = {
  [Frequency.Weekly]: 'weekly',
  [Frequency.WhenFires]: 'when it fires',
  [Frequency.Monthly]: 'monthly',
  [Frequency.Annual]: 'annual',
};

const Row = (c: Candidate): React.ReactNode[] => [
  <Mono>{c.id}</Mono>,
  <span className="text-text-primary">{c.metric}</span>,
  <span className="text-text-primary">{c.versus}</span>,
  c.frequency ? FREQ_LABEL[c.frequency] : '',
  <CategoryChip category={c.category} />,
  <StatusChip status={c.status} />,
];

const HEAD = ['id', 'one metric', 'compared to', 'how often', 'category', 'status'];

export const ByComparison: Story = {
  name: 'By comparison type',
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader
        eyebrow="Replay"
        title="One metric. One comparison. Every card."
      >
        <p>
          The organising rule from the brief: each card is one number about
          you, and how that number compares to something else — your own past,
          every developer, your peers in a topic, or named people. A card with a
          metric and no comparison is a receipt, and receipts do not get posted.
        </p>
        <p>
          {LIVE.filter((c) => c.versus).length} of the {LIVE.length} live cards
          carry an explicit comparison and render it as a standing block. The
          exceptions are structural: the handoff asks for the next action
          instead of comparing anything.
        </p>
      </PageHeader>

      {Object.values(Comparison).map((comparison) => {
        const items = LIVE.filter((c) => c.comparison === comparison);
        return (
          <Section
            key={comparison}
            title={`${COMPARISON_LABEL[comparison]} · ${items.length}`}
            description={COMPARISON_NOTE[comparison]}
          >
            {items.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-5">
                  {items.slice(0, 4).map((c) => (
                    <FrameThumb
                      key={c.id}
                      width={168}
                      candidate={c}
                      data={sampleData[c.id]}
                    />
                  ))}
                </div>
                <Table head={HEAD} rows={items.map(Row)} minWidth={72} />
              </>
            ) : (
              <Callout tone={CalloutTone.Bad} title="Nothing ships here yet">
                <p>
                  Every card that would compare you to named people needs the
                  connection graph, which does not exist. They are cut until it
                  does.
                </p>
              </Callout>
            )}
          </Section>
        );
      })}
    </Page>
  ),
};

export const WeeklyCoverage: Story = {
  name: 'Weekly coverage per category',
  render: () => {
    const cats = Object.values(Category);
    const freqs = [Frequency.Weekly, Frequency.WhenFires, Frequency.Monthly, Frequency.Annual];
    const count = (cat: Category, f: Frequency, tiers: Shareability[]) =>
      LIVE.filter(
        (c) => c.category === cat && c.frequency === f && tiers.includes(c.shareability),
      ).length;

    return (
      <Page>
        <FrameStyles />
        <PageHeader
          eyebrow="Replay"
          title="Does every category have enough to deal, every week?"
        >
          <p>
            The brief asked for granularity: a few or many variants per category
            each week, with some cards allowed to be monthly or rarer. With a
            family cap of one and five slots, a category needs several weekly
            variants or it repeats by week four.
          </p>
        </PageHeader>

        <Section
          title="Share-capable cards (Tier S and A) by category and cadence"
          description="This is the table that says whether the catalog is thick enough. A weekly count under three in any category is a gap."
        >
          <Table
            head={['category', 'weekly', 'when it fires', 'monthly', 'annual', 'total S+A']}
            minWidth={52}
            rows={cats.map((cat) => {
              const tiers = [Shareability.S, Shareability.A];
              const weekly = count(cat, Frequency.Weekly, tiers);
              return [
                <CategoryChip category={cat} />,
                <span
                  className={
                    weekly < 3 ? 'font-bold text-accent-ketchup-default' : 'font-bold text-text-primary'
                  }
                >
                  {weekly}
                </span>,
                count(cat, Frequency.WhenFires, tiers),
                count(cat, Frequency.Monthly, tiers),
                count(cat, Frequency.Annual, tiers),
                <strong className="text-text-primary">
                  {freqs.reduce((n, f) => n + count(cat, f, tiers), 0)}
                </strong>,
              ];
            })}
          />
        </Section>

        <Section title="Including the Tier B cards">
          <Table
            head={['category', 'weekly', 'when it fires', 'monthly', 'annual', 'total live']}
            minWidth={52}
            rows={cats.map((cat) => {
              const tiers = [Shareability.S, Shareability.A, Shareability.B];
              return [
                <CategoryChip category={cat} />,
                count(cat, Frequency.Weekly, tiers),
                count(cat, Frequency.WhenFires, tiers),
                count(cat, Frequency.Monthly, tiers),
                count(cat, Frequency.Annual, tiers),
                <strong className="text-text-primary">
                  {freqs.reduce((n, f) => n + count(cat, f, tiers), 0)}
                </strong>,
              ];
            })}
          />
        </Section>

        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Bad} title="Where it is thin">
            <p>
              Crown has almost nothing that fires weekly once the gamification
              signals are cut: streaks, perfect weeks and achievements are all
              rare triggers. That is fine as long as they promote when they fire,
              but it means a normal week's deck is carried by Surprise and
              Community.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="Where it is thick">
            <p>
              Surprise and Community have the weekly staples — archetype,
              standing in a topic, source obscurity, selectivity, the grid — and
              they are also where the comparisons live. That is the right place
              for the weight to sit, because those are the cards that travel.
            </p>
          </Callout>
        </div>
      </Page>
    );
  },
};
