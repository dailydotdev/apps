import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useRef } from 'react';
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
  Audience,
  Category,
  catalog,
  handoffFrame,
  Moat,
  moatNote,
  Shareability,
  shareabilityNote,
  Status,
} from './catalog';
import { FrameStyles, FrameThumb } from './frames';
import { sampleData } from './data';
import { CardActions } from './CardActions';

const meta: Meta = {
  title: 'Replay/12. Card gallery',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every card in one place, ordered the three ways that actually change a decision.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const ALL: Candidate[] = [
  ...catalog,
  ...annualFlagships,
  handoffFrame,
];

const moatOf = (candidate: Candidate): Moat =>
  candidate.moat ?? Moat.Commodity;
const audienceOf = (candidate: Candidate): Audience =>
  candidate.audience ?? Audience.Reader;

const Tile = ({
  candidate,
  width = 238,
}: {
  candidate: Candidate;
  width?: number;
}): React.ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <figure ref={ref} className="flex flex-col gap-2.5">
      <FrameThumb
        width={width}
        candidate={candidate}
        data={sampleData[candidate.id]}
      />
      <figcaption className="flex flex-col gap-1.5" style={{ width }}>
        <span className="break-all font-mono text-text-primary typo-caption1">
          {candidate.id}
        </span>
        <span className="flex flex-wrap items-center gap-1">
          <CategoryChip category={candidate.category} />
          <StatusChip status={candidate.status} />
        </span>
        <CardActions target={ref} filename={candidate.id} compact />
      </figcaption>
    </figure>
  );
};

const Grid = ({ items }: { items: Candidate[] }): React.ReactElement => (
  <div className="flex flex-wrap gap-7">
    {items.map((candidate) => (
      <Tile key={candidate.id} candidate={candidate} />
    ))}
  </div>
);

const Count = ({
  figure,
  label,
  tone,
}: {
  figure: number;
  label: string;
  tone?: string;
}): React.ReactElement => (
  <div className="flex min-w-[9rem] flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-5 py-4">
    <span className={tone ?? 'text-text-primary'}>
      <span className="typo-mega3">{figure}</span>
    </span>
    <span className="uppercase tracking-[0.1em] text-text-quaternary typo-caption2">
      {label}
    </span>
  </div>
);

export const ByShareability: Story = {
  name: 'By shareability — the ladder',
  render: () => {
    const tiers = [
      Shareability.S,
      Shareability.A,
      Shareability.B,
      Shareability.C,
      Shareability.Cut,
    ];
    const label: Record<Shareability, string> = {
      [Shareability.S]: 'Tier S · hero cards, designed to be posted',
      [Shareability.A]: 'Tier A · share-capable with the right framing',
      [Shareability.B]: 'Tier B · keep in the deck, do not expect shares',
      [Shareability.C]: 'Tier C · cut from the deck',
      [Shareability.Cut]: 'Cut entirely · too rare or degenerate',
    };

    return (
      <Page>
        <FrameStyles />
        <PageHeader
          eyebrow="Replay · gallery"
          title="Every card, ranked by how likely it is to be posted"
        >
          <p>
            Spec v3 reorganised the catalog on one axis, grounded in what our own
            users did with the annual Log: 26,530 opened it, 8.0% of openers
            shared, and the only content that travelled was the identity label.
          </p>
          <p>
            The test for every card: would a developer post this{' '}
            <em>without adding a caption to explain it?</em> If it needs a
            caption, it is not a share unit.
          </p>
        </PageHeader>

        <Section title="The counts">
          <div className="flex flex-wrap gap-4">
            {tiers.map((tier) => (
              <Count
                key={tier}
                figure={ALL.filter((c) => c.shareability === tier).length}
                label={tier === Shareability.Cut ? 'cut entirely' : `tier ${tier}`}
                tone={
                  tier === Shareability.S
                    ? 'text-accent-cabbage-default'
                    : tier === Shareability.Cut || tier === Shareability.C
                    ? 'text-text-quaternary'
                    : undefined
                }
              />
            ))}
          </div>
          <Callout tone={CalloutTone.Bad} title="What the Log measured">
            <p>
              Nearly every gamification signal is rare or dead: weekly quests
              0.3%, all weekly quests 0.02%, peer Cores awards ~110 users, new
              followers 0.65%, perfect week 0.9%, streak milestone ~1.5%. Only
              the reading substrate fires weekly. That is why the bottom two
              tiers are as full as they are.
            </p>
          </Callout>
        </Section>

        {tiers.map((tier) => {
          const items = ALL.filter((c) => c.shareability === tier);
          return (
            <Section
              key={tier}
              title={`${label[tier]} · ${items.length}`}
              description={shareabilityNote[tier]}
            >
              <Grid items={items} />
              {items.some((c) => c.trigger) && (
                <Table
                  head={['Card', 'Fires', 'Trigger, or why it is here']}
                  minWidth={48}
                  rows={items
                    .filter((c) => c.trigger || c.fires)
                    .map((c) => [
                      <Mono>{c.id}</Mono>,
                      c.fires ?? '',
                      c.trigger ?? '',
                    ])}
                />
              )}
            </Section>
          );
        })}
      </Page>
    );
  },
};

export const ByMoat: Story = {
  name: 'By moat — what only we can say',
  render: () => {
    const ours = ALL.filter((item) => moatOf(item) === Moat.Ours);
    const commodity = ALL.filter((item) => moatOf(item) === Moat.Commodity);

    return (
      <Page>
        <FrameStyles />
        <PageHeader
          eyebrow="Replay · gallery"
          title="Not what we can show. What only we can show."
        >
          <p>
            The sharpest question anyone has asked about this catalog, and it
            came from Chris: views are a commodity stat, company-level
            readership is uniquely ours, and nobody else can hand a creator
            that. It is a dimension worth splitting the whole catalog on.
          </p>
          <p>
            A streak is a commodity. Every app has one. Views are a commodity.
            Every platform counts them. What is not a commodity is anything that
            needs a graph sitting across every source and every developer at
            once, because that graph <em>is</em> the product.
          </p>
        </PageHeader>

        <Section title="The split">
          <div className="flex flex-wrap gap-4">
            <Count
              figure={ours.length}
              label="Only we can say this"
              tone="text-accent-cabbage-default"
            />
            <Count figure={commodity.length} label="Anyone could" />
            <Count
              figure={ours.filter((c) => c.status === Status.NeedsApi).length}
              label="Ours, but API-blocked"
              tone="text-accent-ketchup-default"
            />
          </div>
          <Callout tone={CalloutTone.Bad} title="The uncomfortable read">
            <p>
              Almost everything currently shippable is on the commodity side —
              streaks, levels, quests, achievements, volume — and most of the
              differentiated half is blocked on API work.
            </p>
            <p>
              A recap made only of what ships today is a recap a competitor
              could clone in a fortnight, and none of it would make a stranger
              curious about daily.dev specifically. That is the argument for
              doing the API work, and it is a stronger one than any single
              frame.
            </p>
          </Callout>
        </Section>

        <Section
          title={`Only we can say this · ${ours.length}`}
          description={moatNote[Moat.Ours]}
        >
          <Grid items={ours} />
        </Section>

        <Section
          title={`Anyone could say this · ${commodity.length}`}
          description={moatNote[Moat.Commodity]}
        >
          <Grid items={commodity} />
        </Section>
      </Page>
    );
  },
};

export const ByAudience: Story = {
  name: 'By audience — reader and creator',
  render: () => {
    const reader = ALL.filter((item) => audienceOf(item) === Audience.Reader);
    const creator = ALL.filter((item) => audienceOf(item) === Audience.Creator);

    return (
      <Page>
        <FrameStyles />
        <PageHeader
          eyebrow="Replay · gallery"
          title="Two audiences, and only one of them already has a stage"
        >
          <p>
            Everything started reader-facing: what you read, when you read it,
            where you rank as a reader. Creators are a different product with
            different moments, and they are the half that already has an
            audience to post into.
          </p>
          <p>
            The creator cards below come from Chris&apos;s concepts. His ordering
            is worth keeping: rank is the vanity baseline that is cheapest to
            build and differentiates least, the unread thread is the one that
            earns a click <em>and</em> a reply, and company readership is the one
            nobody else can hand over.
          </p>
        </PageHeader>

        <Section
          title={`Creator · ${creator.length}`}
          description="Fewer cards, higher expected share rate, and every one of them needs API work we have not done."
        >
          <Grid items={creator} />
        </Section>

        <Callout tone={CalloutTone.Good} title="Every creator card ends in a verb">
          <p>
            Join the discussion. Jump into the thread. Defend your take. See the
            full list. The call to action is the next step in the loop, not a
            generic invitation to open the app, and it changes per card because
            the intent it is catching is different each time.
          </p>
        </Callout>

        <Section title={`Reader · ${reader.length}`}>
          <Grid items={reader} />
        </Section>
      </Page>
    );
  },
};

export const ByCategory: Story = {
  name: 'By category',
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader
        eyebrow="Replay · gallery"
        title="Stat, surprise, community, crown"
      >
        <p>
          The composition axis. The selector anchors one seat each for crown,
          surprise and community before score decides anything, so no recap is
          five trophies or five statistics.
        </p>
      </PageHeader>
      {Object.values(Category).map((category) => {
        const items = ALL.filter((item) => item.category === category);
        return (
          <Section key={category} title={`${category} · ${items.length}`}>
            <Grid items={items} />
          </Section>
        );
      })}
    </Page>
  ),
};

export const Index: Story = {
  name: 'The index',
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader
        eyebrow="Replay · gallery"
        title={`All ${ALL.length} cards, every dimension`}
      >
        <p>
          The whole catalog on one screen. Sorted so the differentiated cards
          come first, because that is the order that should decide what gets
          built.
        </p>
      </PageHeader>
      <Table
        head={[
          'id',
          'Audience',
          'Moat',
          'Category',
          'What it says',
          'Tier',
          'Status',
        ]}
        minWidth={82}
        rows={[...ALL]
          .sort((a, b) => {
            const moatDiff =
              Number(moatOf(b) === Moat.Ours) - Number(moatOf(a) === Moat.Ours);
            return moatDiff !== 0 ? moatDiff : a.id.localeCompare(b.id);
          })
          .map((candidate) => [
            <Mono>{candidate.id}</Mono>,
            <span className="text-text-tertiary">{audienceOf(candidate)}</span>,
            moatOf(candidate) === Moat.Ours ? (
              <span className="font-bold text-accent-cabbage-default">ours</span>
            ) : (
              <span className="text-text-quaternary">commodity</span>
            ),
            <CategoryChip category={candidate.category} />,
            <span className="text-text-primary">{candidate.headline}</span>,
            <TierChip tier={candidate.tier} />,
            <StatusChip status={candidate.status} />,
          ])}
      />
    </Page>
  ),
};
