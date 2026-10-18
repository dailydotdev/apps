import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import ExtensionProviders from '../../../../extension/_providers';
import {
  compactCount,
  format,
  Label,
  Page,
  TierReportProvider,
  VariantCard,
} from './kit';
import type { Feed, Variant } from './bars';
import { TODAY, TODAY_FEED, TodayBar, VARIANTS } from './bars';

/**
 * Ido, after `card_imps` won (2026-10-07): "try to make the engagement buttons
 * bigger again". In August (#6394) the feed bar went 32px → 24px so six
 * actions with counters fit the 272px narrowest card. Twelve ways to get the
 * size back — eight change the bar, four change the feed's spacing — each on
 * a card built from the production parts with only the bar swapped, and each
 * with a fit meter read from the DOM.
 */

/* ------------------------------------------------------------------------ */
/* Feed geometry                                                             */
/* ------------------------------------------------------------------------ */

const NARROW_CARD = 272;
/** The narrowest 3-column feed today: margins + three 272px cards + gaps. */
const NARROW_FEED = 2 * TODAY_FEED.side + 3 * NARROW_CARD + 2 * TODAY_FEED.gap;

const columnsFor = (width: number, feed: Feed, max = 3): number => {
  let cols = max;
  const inner = width - 2 * feed.side;
  while (cols > 1 && (inner - feed.gap * (cols - 1)) / cols < feed.minCard) {
    cols -= 1;
  }
  return cols;
};

const cardWidthFor = (width: number, feed: Feed, max = 3): number => {
  const cols = columnsFor(width, feed, max);
  return (width - 2 * feed.side - feed.gap * (cols - 1)) / cols;
};

const round1 = (n: number): number => Math.round(n * 10) / 10;

/** The width a variant's card gets in the narrowest feed. */
const narrowCardWidth = (variant: Variant): number =>
  variant.feed ? cardWidthFor(NARROW_FEED, variant.feed) : NARROW_CARD;

/* ------------------------------------------------------------------------ */
/* Pieces                                                                    */
/* ------------------------------------------------------------------------ */

const leverTone: Record<Variant['lever'], string> = {
  Size: 'text-accent-avocado-default',
  Remove: 'text-accent-ketchup-default',
  Group: 'text-accent-cabbage-default',
  Hierarchy: 'text-accent-bun-default',
  Layout: 'text-accent-blueCheese-default',
  'Feed spacing': 'text-accent-cheese-default',
};

const Heading = ({ variant }: { variant: Variant }): ReactElement => (
  <div className="mb-3">
    <p
      className={classNames(
        'font-bold uppercase tracking-wider typo-caption1',
        leverTone[variant.lever],
      )}
    >
      {variant.number ? `${variant.number} · ` : ''}
      {variant.lever}
    </p>
    <h3 className="font-bold text-text-primary typo-title3">{variant.name}</h3>
  </div>
);

const Notes = ({ variant }: { variant: Variant }): ReactElement => (
  <div className="flex max-w-md flex-col gap-3 text-text-secondary typo-callout">
    <p className="text-pretty">{variant.pitch}</p>
    {variant.changes.length > 0 && (
      <div>
        <p className="mb-1 font-bold text-text-primary typo-footnote">
          What changes
        </p>
        <ul className="list-disc pl-5 text-text-tertiary typo-footnote">
          {variant.changes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    )}
    <div>
      <p className="mb-1 font-bold text-text-primary typo-footnote">
        Trade-offs
      </p>
      <ul className="list-disc pl-5 text-text-tertiary typo-footnote">
        {variant.tradeoffs.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  </div>
);

const SingleCard = ({
  variant,
  width,
}: {
  variant: Variant;
  width: number;
}): ReactElement => (
  <VariantCard
    width={width}
    bar={<variant.Bar />}
    imageClassName={variant.imageClassName}
  />
);

/**
 * A slice of the real feed: the page background, the feed's side padding and
 * two rows of cards at the gap and minimum width the variant sets.
 */
const FeedView = ({
  width,
  feed,
  variant,
  rows = 2,
  maxCols = 3,
}: {
  width: number;
  feed: Feed;
  variant: Variant;
  rows?: number;
  maxCols?: number;
}): ReactElement => {
  const [tier, setTier] = useState<number>();
  const report = useCallback((t: number) => setTier(t), []);
  const cols = columnsFor(width, feed, maxCols);
  const card = cardWidthFor(width, feed, maxCols);
  return (
    <div>
      <p className="mb-2 text-text-tertiary tabular-nums typo-caption1">
        {width}px feed · {cols} columns · {feed.gap}px gap · {feed.side}px
        margins → cards <b className="text-text-primary">{round1(card)}px</b>
        {tier && (
          <>
            {' '}
            → unlocks{' '}
            <b className="text-accent-avocado-default">{tier}px buttons</b>
          </>
        )}
      </p>
      <TierReportProvider value={report}>
        <div
          className="grid rounded-16 border border-border-subtlest-tertiary bg-background-default"
          style={{
            width,
            padding: `16px ${feed.side}px`,
            gap: feed.gap,
            gridTemplateColumns: `repeat(${cols}, ${card}px)`,
          }}
        >
          {Array.from({ length: cols * rows }, (_, i) => (
            <SingleCard key={i} variant={variant} width={card} />
          ))}
        </div>
      </TierReportProvider>
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* Context and the number rule                                               */
/* ------------------------------------------------------------------------ */

const Context = (): ReactElement => (
  <div className="mb-10 grid max-w-5xl gap-4 tablet:grid-cols-3">
    {[
      {
        t: 'Why they got small',
        b: 'In August (#6394) six actions with counters needed up to 288px in a 262px row, so the bar dropped to 24px buttons and 16px icons. Awards have since left the card, but impressions took the slot: still six.',
      },
      {
        t: 'What already lost',
        b: 'Moving the actions onto the cover image (feed_card_glass_actions) lost its A/B test (#6470). None of these put the bar on the image.',
      },
      {
        t: 'The bar to beat',
        b: 'Today’s 24px targets meet WCAG 2.2 AA (24×24) with no margin. Apple asks for 44pt and Material for 48dp touch targets — every variant here moves toward those.',
      },
    ].map(({ t, b }) => (
      <div
        key={t}
        className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
      >
        <p className="mb-1 font-bold text-text-primary typo-callout">{t}</p>
        <p className="text-pretty text-text-tertiary typo-footnote">{b}</p>
      </div>
    ))}
  </div>
);

const NUMBER_EXAMPLES = [
  7, 312, 1_000, 1_740, 9_960, 10_400, 23_400, 234_500, 999_999, 1_250_000,
  12_700_000,
];

const NumberRule = (): ReactElement => (
  <div className="mb-10 max-w-5xl rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
    <p className="mb-1 font-bold text-text-primary typo-callout">
      New number rule, used by every variant
    </p>
    <p className="mb-3 max-w-3xl text-pretty text-text-tertiary typo-footnote">
      A decimal only while the leading number is a single digit (1.7K, 9.9K,
      1.2M). From 10 up the number is whole (23K, 234K). Rounded down, so no
      count is ever more than four characters — 234.5K → 234K alone frees about
      10px in the bar. This changes the shared `largeNumberFormat`, so it would
      apply everywhere counts show.
    </p>
    <div className="flex flex-wrap gap-x-6 gap-y-2 tabular-nums typo-footnote">
      {NUMBER_EXAMPLES.map((n) => (
        <span key={n} className="flex gap-1.5">
          <span className="text-text-quaternary line-through">{format(n)}</span>
          <span className="font-bold text-text-primary">{compactCount(n)}</span>
        </span>
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------------ */
/* ★ Overview                                                               */
/* ------------------------------------------------------------------------ */

const CardTile = ({ variant }: { variant: Variant }): ReactElement => (
  <div className="flex flex-col">
    <Heading variant={variant} />
    <SingleCard variant={variant} width={narrowCardWidth(variant)} />
    <p className="mt-2 max-w-[17rem] text-pretty text-text-tertiary typo-caption1">
      {variant.feed
        ? `Card width in the same ${NARROW_FEED}px feed: ${round1(
            narrowCardWidth(variant),
          )}px.`
        : variant.pitch}
    </p>
  </div>
);

const Overview = (): ReactElement => (
  <Page
    title="Bigger card actions"
    intro={
      <>
        Same post on every card, with the widest counts each one gets: 1.7K
        upvotes, 312 comments, 234K impressions. Every card is shown at the
        narrowest width it gets in a 3-column feed ({NARROW_FEED}px). The meter
        under each card is measured live, and every bar is clickable.
      </>
    }
  >
    <Context />
    <NumberRule />
    <h2 className="mb-1 font-bold typo-title3">Change the bar (1–8)</h2>
    <p className="mb-6 text-text-tertiary typo-callout">
      The feed stays as it is; the bar makes better use of a 272px card.
    </p>
    <div className="mb-14 flex flex-wrap gap-x-10 gap-y-12">
      {[TODAY, ...VARIANTS.filter((v) => !v.feed)].map((variant) => (
        <CardTile key={variant.id} variant={variant} />
      ))}
    </div>
    <h2 className="mb-1 font-bold typo-title3">Change the feed (9–12)</h2>
    <p className="mb-6 max-w-3xl text-text-tertiary typo-callout">
      Less space between and around the cards, so each card is wider and the bar
      steps up to the biggest size that fits — all six actions kept. Open each
      one to see it as a full feed.
    </p>
    <div className="flex flex-wrap gap-x-10 gap-y-12">
      {VARIANTS.filter((v) => v.feed).map((variant) => (
        <CardTile key={variant.id} variant={variant} />
      ))}
    </div>
  </Page>
);

/* ------------------------------------------------------------------------ */
/* Close-up                                                                  */
/* ------------------------------------------------------------------------ */

const CloseUp = (): ReactElement => (
  <Page
    title="Bars close-up"
    intro="The bottom of each card at its narrowest feed width, enlarged 1.5× so the sizes are easy to compare. Hover and click to feel the targets."
  >
    <div className="flex flex-wrap gap-x-12 gap-y-8" style={{ zoom: 1.5 }}>
      {[TODAY, ...VARIANTS].map((variant) => (
        <div key={variant.id}>
          <p className="mb-1 font-bold text-text-secondary typo-footnote">
            {variant.number}. {variant.name}
          </p>
          <div
            className="flex flex-col justify-end overflow-hidden"
            style={{ height: 120 }}
          >
            <SingleCard variant={variant} width={narrowCardWidth(variant)} />
          </div>
        </div>
      ))}
    </div>
  </Page>
);

/* ------------------------------------------------------------------------ */
/* Width matrix                                                              */
/* ------------------------------------------------------------------------ */

const WIDTHS = [272, 304, 340];

const Matrix = (): ReactElement => (
  <Page
    title="Every bar at 272 / 304 / 340px"
    intro="The bar variants at three card widths, to check nothing overflows the narrowest card and nothing looks lost on a wide one. The feed variants (9–12) are left out: they change the width itself."
  >
    <div className="flex flex-col gap-10">
      {[TODAY, ...VARIANTS.filter((v) => !v.feed)].map((variant) => (
        <div key={variant.id}>
          <Heading variant={variant} />
          <div className="flex flex-wrap items-start gap-8">
            {WIDTHS.map((w) => (
              <div key={w}>
                <Label>{w}px</Label>
                <SingleCard variant={variant} width={w} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Page>
);

/* ------------------------------------------------------------------------ */
/* Spacing ladder                                                            */
/* ------------------------------------------------------------------------ */

const LADDER: Feed[] = [
  TODAY_FEED,
  { gap: 24, side: 24, minCard: 272 },
  { gap: 20, side: 24, minCard: 272 },
  { gap: 16, side: 16, minCard: 272 },
  { gap: 12, side: 8, minCard: 272 },
];

/** A wider laptop feed. Columns stay at three: production sets the count per breakpoint, so spacing never adds one. */
const WIDE_FEED = 1200;

const LadderPage = ({ variant }: { variant: Variant }): ReactElement => (
  <Page title={`${variant.number}. ${variant.name}`}>
    <div className="mb-10">
      <Notes variant={variant} />
    </div>
    {[
      { width: NARROW_FEED, maxCols: 3, title: 'Narrowest 3-column feed' },
      { width: WIDE_FEED, maxCols: 3, title: 'A wider laptop feed' },
    ].map(({ width, maxCols, title }) => (
      <section key={title} className="mb-14">
        <h2 className="mb-6 font-bold typo-title3">
          {title} ({width}px)
        </h2>
        <div className="flex flex-col gap-10">
          {LADDER.map((feed, i) => (
            <div key={`${feed.gap}-${feed.side}`}>
              <Label tone={i === 0 ? 'today' : 'new'}>
                {i === 0 ? 'Today' : `Gap ${feed.gap} · margins ${feed.side}`}
              </Label>
              <FeedView
                width={width}
                feed={feed}
                variant={variant}
                rows={1}
                maxCols={maxCols}
              />
            </div>
          ))}
        </div>
      </section>
    ))}
  </Page>
);

/* ------------------------------------------------------------------------ */
/* One page per variant                                                      */
/* ------------------------------------------------------------------------ */

const VariantPage = ({ variant }: { variant: Variant }): ReactElement => {
  if (variant.id === 'feed-ladder') {
    return <LadderPage variant={variant} />;
  }
  if (variant.feed) {
    return (
      <Page title={`${variant.number}. ${variant.name}`}>
        <div className="mb-10">
          <Notes variant={variant} />
        </div>
        <div className="flex flex-col gap-12">
          <div>
            <Label tone="today">Today</Label>
            <FeedView width={NARROW_FEED} feed={TODAY_FEED} variant={TODAY} />
          </div>
          <div>
            <Label tone="new">With this change</Label>
            <FeedView
              width={NARROW_FEED}
              feed={variant.feed}
              variant={variant}
            />
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title={`${variant.number}. ${variant.name}`}>
      <div className="flex flex-wrap items-start gap-10">
        <Notes variant={variant} />
        <div>
          <Label tone="today">Today · 272px</Label>
          <VariantCard width={272} bar={<TodayBar />} />
        </div>
        {WIDTHS.map((w) => (
          <div key={w}>
            <Label tone="new">New · {w}px</Label>
            <SingleCard variant={variant} width={w} />
          </div>
        ))}
      </div>
    </Page>
  );
};

/* ------------------------------------------------------------------------ */
/* Grid lab                                                                  */
/* ------------------------------------------------------------------------ */

interface LabArgs {
  bar: string;
  width: number;
  gap: number;
  side: number;
  minCard: number;
}

const GridLab = ({ bar, width, gap, side, minCard }: LabArgs): ReactElement => {
  const variant = [TODAY, ...VARIANTS].find((v) => v.id === bar) ?? VARIANTS[0];
  return (
    <Page
      title="Grid lab"
      intro="Pick any bar, then move the feed width, gap, margins and minimum card width in Controls. Columns drop when a card would go below the minimum. The feed bars (feed-*) step up to the biggest button that fits; the fit meters show which bars survive."
    >
      <Heading variant={variant} />
      <FeedView width={width} feed={{ gap, side, minCard }} variant={variant} />
    </Page>
  );
};

/* ------------------------------------------------------------------------ */

const meta: Meta = {
  title: 'Experiments/Card actions/Archive/Round 1',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const Overview_: Story = {
  name: '★ Overview',
  render: () => <Overview />,
};

export const BarsCloseUp: Story = {
  name: 'Bars close-up',
  render: () => <CloseUp />,
};

export const WidthMatrix: Story = {
  name: 'Width matrix',
  render: () => <Matrix />,
};

// Names are written out: Storybook's index only reads literal `name`s.
const variantStory = (index: number) => ({
  render: () => <VariantPage variant={VARIANTS[index]} />,
});

export const V1SizeUp: Story = {
  ...variantStory(0),
  name: '1. Same six, one size up',
};
export const V2Five: Story = {
  ...variantStory(1),
  name: '2. Five actions, back at 32px',
};
export const V3VotePill: Story = {
  ...variantStory(2),
  name: '3. Vote pill',
};
export const V4PrimaryPair: Story = {
  ...variantStory(3),
  name: '4. Primary pair',
};
export const V5EdgeStrip: Story = {
  ...variantStory(4),
  name: '5. Edge-to-edge strip',
};
export const V6Stacked: Story = {
  ...variantStory(5),
  name: '6. Stacked counts',
};
export const V7StatsLine: Story = {
  ...variantStory(6),
  name: '7. Stats line + icon row',
};
export const V8Adaptive: Story = {
  ...variantStory(7),
  name: '8. Size follows the card',
};
export const V9FeedGap: Story = {
  ...variantStory(8),
  name: '9. Tighter feed gap',
};
export const V10FeedMargins: Story = {
  ...variantStory(9),
  name: '10. Tighter gap and margins',
};
export const V11FeedLadder: Story = {
  ...variantStory(10),
  name: '11. Spacing ladder',
};
export const V12FeedMinCard: Story = {
  ...variantStory(11),
  name: '12. Wider minimum card',
};

export const Lab: StoryObj<LabArgs> = {
  name: 'Grid lab',
  args: {
    bar: 'feed-gap',
    width: NARROW_FEED,
    gap: 20,
    side: 24,
    minCard: NARROW_CARD,
  },
  argTypes: {
    bar: {
      control: 'select',
      options: [TODAY, ...VARIANTS].map((v) => v.id),
    },
    width: { control: { type: 'range', min: 640, max: 1800, step: 8 } },
    gap: { control: { type: 'range', min: 0, max: 40, step: 4 } },
    side: { control: { type: 'range', min: 0, max: 40, step: 4 } },
    minCard: { control: { type: 'range', min: 240, max: 400, step: 8 } },
  },
  render: (args) => <GridLab {...args} />,
};
