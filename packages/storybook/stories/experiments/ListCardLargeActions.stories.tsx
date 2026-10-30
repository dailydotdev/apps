import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { featureListCardLargeActions } from '@dailydotdev/shared/src/lib/featureManagement';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { PostTypeToListCard } from '@dailydotdev/shared/src/components/cards/common/listCards';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import post, { sharePost } from '@dailydotdev/shared/__tests__/fixture/post';
import { pollPost } from '@dailydotdev/shared/__tests__/fixture/pollPost';
import ExtensionProviders from '../extension/_providers';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';

/**
 * `list_card_large_actions`, control vs treatment, on the production list
 * cards (the phone and tablet feed) with the shared test fixtures. Treatment:
 * the bar's buttons go from 24px to 32px and the icons from 16px to 20px, the
 * same size grid cards use. The bookmark stays in the bar, and the row grows
 * to fit, so each card is 8px taller.
 */

const article: Post = {
  ...post,
  numUpvotes: 63,
  numComments: 8,
  analytics: { impressions: 197000 },
} as Post;
const saved: Post = {
  ...article,
  id: 'story-saved',
  title: 'A post you already saved',
  bookmarked: true,
  upvoted: true,
} as Post;
const freeform: Post = {
  ...article,
  id: 'story-freeform',
  type: PostType.Freeform,
  title: 'What I learned rewriting our feed in a weekend',
  contentHtml: '<p>Notes from the rewrite.</p>',
} as Post;
const collection: Post = {
  ...article,
  id: 'story-collection',
  type: PostType.Collection,
  title: 'React Server Components, explained',
  collectionSources: [post.source],
  numCollectionSources: 3,
} as Post;

const CARDS: { label: string; post: Post }[] = [
  { label: 'Article', post: article },
  { label: 'Saved and upvoted', post: saved },
  { label: 'Share', post: sharePost },
  { label: 'Post', post: freeform },
  { label: 'Poll', post: pollPost },
  { label: 'Collection', post: collection },
];

const handlers = {
  onPostClick: fn(),
  onPostAuxClick: fn(),
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
  onShare: fn(),
  onReadArticleClick: fn(),
};

const Column = ({
  on,
  counter,
  children,
}: {
  on: boolean;
  counter: CounterStyle;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div>
      <p className="font-bold text-text-primary typo-callout">
        {on ? 'Treatment' : 'Control'}
      </p>
      <p className="text-text-tertiary typo-caption1">
        {on ? '32px buttons' : 'Today: 24px buttons'}
        {on && (counter === 'x' ? ', 18px icons' : ', 20px icons')}
        {!on && ', 16px icons'}
        {counter === 'x' && ', numbers 4px from the icon'}
      </p>
    </div>
    <FeatureOverrides values={{ [featureListCardLargeActions.id]: on }}>
      <div
        data-counter={counter}
        data-large={on}
        className="flex w-full max-w-[40rem] flex-col"
      >
        {children}
      </div>
    </FeatureOverrides>
  </div>
);

interface ListArgs {
  show: 'both' | 'control' | 'treatment';
  counter: CounterStyle;
}

const ListCards = ({ show, counter }: ListArgs): ReactElement => (
  <div className="min-h-screen bg-background-default p-4 tablet:p-8">
    <style>{X_COUNTER_CSS}</style>
    <div className="flex flex-col gap-10 laptop:flex-row">
      {[false, true]
        .filter((on) => show === 'both' || (show === 'treatment') === on)
        .map((on) => (
          <Column key={String(on)} on={on} counter={counter}>
            {CARDS.map(({ label, post: cardPost }) => {
              const Card = PostTypeToListCard[cardPost.type] ?? ArticleList;
              return <Card key={label} post={cardPost} {...handlers} />;
            })}
          </Column>
        ))}
    </div>
  </div>
);

const meta: Meta = {
  title: 'Experiments/List card large actions',
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

export const List: StoryObj<ListArgs> = {
  name: 'List cards (phone and tablet)',
  args: { show: 'both', counter: 'x' },
  argTypes: {
    show: {
      control: 'inline-radio',
      options: ['both', 'control', 'treatment'],
    },
    counter: { control: 'inline-radio', options: ['x', 'today'] },
  },
  render: (args) => <ListCards {...args} />,
};

/**
 * Small screens. Big counts widen the bar, and the treatment's 32px buttons
 * leave less room between them. Each phone below is a real viewport (an
 * iframe of the Frame story), so the cards get the same breakpoints a phone
 * gets, and the gaps are measured live from the rendered bar.
 */

type OptionKey = 'control' | 'a' | 'b' | 'c';
type CountKey = 'typical' | 'views' | 'viral' | 'worst';

const OPTIONS: Record<
  OptionKey,
  {
    tag: string;
    name: string;
    what: string;
    cost: string;
    large: boolean;
    smallBar: boolean;
    noCopyBelow360: boolean;
  }
> = {
  control: {
    tag: 'Control',
    name: 'Today’s 24px bar',
    what: 'What every list card shows today and what the control arm keeps.',
    cost: 'Baseline for comparison.',
    large: false,
    smallBar: false,
    noCopyBelow360: false,
  },
  a: {
    tag: 'A',
    name: '32px on every width',
    what: '#7127 as it is: 32px buttons and 20px icons on every phone.',
    cost: 'Simplest. 320px is the tight width: check its gap in the table.',
    large: true,
    smallBar: false,
    noCopyBelow360: false,
  },
  b: {
    tag: 'B',
    name: '32px, today’s bar below 360px',
    what: 'Phones narrower than 360px keep the 24px bar inside the treatment. Everyone from 360px up gets 32px.',
    cost: '320px readers in the treatment don’t see the change. Check their share before launch.',
    large: true,
    smallBar: true,
    noCopyBelow360: false,
  },
  c: {
    tag: 'C',
    name: '32px, no copy link below 360px',
    what: 'Everyone gets 32px. On phones narrower than 360px the copy link button leaves the bar to make room.',
    cost: 'Copy link taps on 320px phones are lost from the card. A second change inside the treatment.',
    large: true,
    smallBar: false,
    noCopyBelow360: true,
  },
};

const OPTION_ORDER: OptionKey[] = ['control', 'a', 'b', 'c'];

const COUNTS: Record<
  CountKey,
  { label: string; upvotes: number; comments: number; views: number }
> = {
  typical: { label: 'Typical', upvotes: 63, comments: 8, views: 197000 },
  views: { label: 'Big views', upvotes: 14, comments: 2, views: 150900 },
  viral: { label: 'Viral', upvotes: 1200, comments: 345, views: 999900 },
  worst: { label: 'Worst case', upvotes: 99900, comments: 9900, views: 999900 },
};

const COUNT_ORDER: CountKey[] = ['typical', 'views', 'viral', 'worst'];
const WIDTHS = [320, 360, 375];
const NARROW = 360;
const HEALTHY_GAP = 4;

// The number rule from #6835, applied to the value so today's formatter
// prints it: one decimal only under 10 in its unit, always rounded down.
const roundDownForRule = (value: number): number => {
  if (value < 1000) {
    return value;
  }
  const unit = 1000 ** Math.floor(Math.log10(value) / 3);
  const scaled = value / unit;
  const step = scaled < 10 ? 10 : 1;
  return (Math.floor(scaled * step) / step) * unit;
};

const countValue = (value: number, rule: boolean): number =>
  rule ? roundDownForRule(value) : value;

const RULE_EXAMPLES = [1790, 9940, 23400, 150900, 1250000];

interface Measure {
  gap: number;
  offscreen: number;
}

const measureBar = (card: HTMLElement): Measure | null => {
  const bar = card
    .querySelector('[id$="-upvote-btn"]')
    ?.closest<HTMLElement>('div.flex-1');
  if (!bar) {
    return null;
  }
  const rects = Array.from(bar.children)
    .map((child) => child.getBoundingClientRect())
    .filter((rect) => rect.width > 0);
  const gaps = rects.slice(1).map((rect, i) => rect.left - rects[i].right);
  const right = Math.max(...rects.map((rect) => rect.right));
  return {
    gap: Math.min(...gaps),
    offscreen: Math.max(0, right - document.documentElement.clientWidth),
  };
};

const verdict = ({
  gap,
  offscreen,
}: Measure): { text: string; bad: boolean } => {
  if (offscreen > 0.5) {
    return { text: `${offscreen.toFixed(1)}px off screen`, bad: true };
  }
  if (gap < 0.5) {
    return { text: 'touching', bad: true };
  }
  return {
    text: `${gap.toFixed(1)}px gap`,
    bad: gap < HEALTHY_GAP,
  };
};

const Badge = ({ measure }: { measure?: Measure | null }): ReactElement => {
  if (!measure) {
    return <span className="text-text-quaternary typo-caption1">…</span>;
  }
  const { text, bad } = verdict(measure);
  return (
    <span
      className={classNames(
        'rounded-6 px-1.5 py-0.5 font-bold typo-caption1',
        bad
          ? 'bg-accent-ketchup-flat text-accent-ketchup-default'
          : 'bg-accent-avocado-flat text-accent-avocado-default',
      )}
    >
      {text}
    </span>
  );
};

type CounterStyle = 'today' | 'x';

interface FrameArgs {
  option: OptionKey;
  rule: boolean;
  counter: CounterStyle;
  /** Close-ups: only the typical card, with its upvote in the hover state. */
  closeUp: boolean;
}

// X: 18.75px icons, the number 4px away at 13px regular. Ours today: 6px on
// the 24px bar and 8px on the 32px bar, at 13px medium, with 20px icons on the
// 32px bar. The X style uses 18px icons there, and the 4px gap pulls the
// number over the button's own padding, so it overlaps the hover background.
const BAR_BUTTONS = [
  'upvote',
  'comment',
  'downvote',
  'bookmark',
  'copy',
  'impressions',
]
  .map((name) => `[id$='-${name}-btn']`)
  .join(',');

const X_COUNTER_CSS = `
  [data-counter='x'] .btn-quaternary > label {
    padding-left: 0 !important;
    font-weight: 400;
  }
  [data-counter='x'] .btn-quaternary > label * { font-weight: 400; }
  [data-counter='x'][data-large='true'] .btn-quaternary > label {
    margin-left: -0.1875rem;
  }
  [data-counter='x'][data-large='true'] :is(${BAR_BUTTONS}) svg {
    width: 1.125rem !important;
    height: 1.125rem !important;
  }
`;

const frameKey = (args: FrameArgs, width: number): string =>
  [args.option, args.rule, args.counter, args.closeUp, width].join('@');

const FrameCards = (args: FrameArgs): ReactElement => {
  const { option, rule, counter, closeUp } = args;
  const config = OPTIONS[option];
  const ref = useRef<HTMLDivElement>(null);
  const [measures, setMeasures] = useState<Record<string, Measure | null>>({});
  const narrow = window.innerWidth < NARROW;
  const large = config.large && !(config.smallBar && narrow);
  const hideCopy = config.noCopyBelow360 && narrow;
  const cases = closeUp ? (['typical'] as CountKey[]) : COUNT_ORDER;

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) {
      return undefined;
    }
    if (closeUp) {
      root.querySelector('[id$="-upvote-btn"]')?.classList.add('hover');
    }
    const measure = () => {
      const next = Object.fromEntries(
        Array.from(root.querySelectorAll<HTMLElement>('[data-case]')).map(
          (card) => [card.dataset.case, measureBar(card)],
        ),
      );
      setMeasures(next);
      window.parent.postMessage(
        {
          source: 'list-card-small-screens',
          key: frameKey(args, window.innerWidth),
          height: root.scrollHeight,
          measures: next,
        },
        '*',
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option, rule, counter, closeUp]);

  return (
    <FeatureOverrides values={{ [featureListCardLargeActions.id]: large }}>
      <div
        ref={ref}
        data-counter={counter}
        data-large={large}
        className="flex flex-col bg-background-default"
      >
        <style>{'img[alt="Post Cover image"]{display:none}'}</style>
        <style>{X_COUNTER_CSS}</style>
        {hideCopy && <style>{'[id$="-copy-btn"]{display:none}'}</style>}
        {cases.map((key) => {
          const count = COUNTS[key];
          const cardPost = {
            ...article,
            id: `small-${key}`,
            numUpvotes: countValue(count.upvotes, rule),
            numComments: countValue(count.comments, rule),
            analytics: { impressions: countValue(count.views, rule) },
          } as Post;
          return (
            <div key={key} data-case={key}>
              {!closeUp && (
                <div className="flex items-center justify-between px-4 pt-3">
                  <span className="font-bold text-text-secondary typo-caption1">
                    {count.label}
                  </span>
                  <Badge measure={measures[key]} />
                </div>
              )}
              <ArticleList post={cardPost} {...handlers} />
            </div>
          );
        })}
      </div>
    </FeatureOverrides>
  );
};

const FRAME_ID = 'experiments-list-card-large-actions--frame';

const frameSrc = ({ option, rule, counter, closeUp }: FrameArgs): string =>
  `iframe.html?id=${FRAME_ID}&viewMode=story&args=option:${option};rule:!${rule};counter:${counter};closeUp:!${closeUp}&globals=theme:dark`;

type Results = Record<string, Record<string, Measure | null>>;

interface FrameReports {
  results: Results;
  heights: Record<string, number>;
}

const useFrameReports = (): FrameReports => {
  const [reports, setReports] = useState<FrameReports>({
    results: {},
    heights: {},
  });

  useEffect(() => {
    const onMessage = ({ data }: MessageEvent) => {
      if (data?.source !== 'list-card-small-screens') {
        return;
      }
      setReports((prev) => ({
        results: { ...prev.results, [data.key]: data.measures },
        heights: { ...prev.heights, [data.key]: data.height },
      }));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return reports;
};

// The dev server fails module imports when many frames boot at once, so
// frames load a few at a time: one more per report, or every few seconds.
const useLoadQueue = (keys: string[], heights: Record<string, number>) => {
  const [count, setCount] = useState(3);
  const reported = keys.filter((key) => heights[key] !== undefined).length;
  const signature = keys.join('|');

  useEffect(() => {
    setCount(3);
    const timer = window.setInterval(() => setCount((c) => c + 1), 4000);
    return () => window.clearInterval(timer);
  }, [signature]);

  return (index: number) => index < Math.max(count, reported + 3);
};

const Phone = ({
  args,
  width,
  label,
  height,
  isLoaded,
  scale = 1,
}: {
  args: FrameArgs;
  width: number;
  label: string;
  height?: number;
  isLoaded: boolean;
  scale?: number;
}): ReactElement => {
  // A frame that never reports hit a failed module import: load it again.
  const [attempt, setAttempt] = useState(0);
  const isReported = height !== undefined;
  const frameHeight = height ?? (args.closeUp ? 200 : 900);

  useEffect(() => {
    if (!isLoaded || isReported) {
      return undefined;
    }
    const timer = window.setTimeout(() => setAttempt((a) => a + 1), 12000);
    return () => window.clearTimeout(timer);
  }, [isLoaded, isReported, attempt]);

  return (
    <div className="flex flex-col gap-2">
      <span className="font-bold text-text-tertiary typo-caption1">
        {label}
      </span>
      <div
        className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
        style={{ width: width * scale, height: frameHeight * scale }}
      >
        {isLoaded && (
          <iframe
            key={attempt}
            title={label}
            src={frameSrc(args)}
            width={width}
            height={frameHeight}
            className="block origin-top-left border-0"
            style={scale === 1 ? undefined : { transform: `scale(${scale})` }}
          />
        )}
      </div>
    </div>
  );
};

const worstOf = (measures?: Record<string, Measure | null>) =>
  measures
    ? Object.values(measures).reduce<Measure | null>(
        (acc, m) =>
          !m
            ? acc
            : !acc ||
              m.offscreen > acc.offscreen ||
              (m.offscreen === acc.offscreen && m.gap < acc.gap)
            ? m
            : acc,
        null,
      )
    : undefined;

const Scoreboard = ({
  results,
  base,
}: {
  results: Results;
  base: Omit<FrameArgs, 'option'>;
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full text-left typo-footnote">
      <thead>
        <tr className="text-text-tertiary">
          <th className="p-3 font-normal">Option</th>
          {WIDTHS.map((width) => (
            <th key={width} className="p-3 font-normal">
              Worst case at {width}px
            </th>
          ))}
          <th className="p-3 font-normal">Everyone sees 32px</th>
        </tr>
      </thead>
      <tbody>
        {OPTION_ORDER.map((option) => {
          const config = OPTIONS[option];
          return (
            <tr
              key={option}
              className="border-t border-border-subtlest-tertiary"
            >
              <td className="p-3 text-text-primary">
                <span className="mr-2 font-bold">{config.tag}</span>
                {config.name}
              </td>
              {WIDTHS.map((width) => (
                <td key={width} className="p-3">
                  <Badge
                    measure={worstOf(
                      results[frameKey({ ...base, option }, width)],
                    )}
                  />
                </td>
              ))}
              <td className="p-3 text-text-secondary">
                {!config.large && 'No'}
                {config.large && config.smallBar && 'Not below 360px'}
                {config.large && !config.smallBar && 'Yes'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const Segmented = <T extends string | boolean>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}): ReactElement => (
  <div className="flex gap-1 rounded-12 bg-surface-float p-1">
    {options.map((option) => (
      <button
        key={String(option.value)}
        type="button"
        onClick={() => onChange(option.value)}
        className={classNames(
          'rounded-8 px-3 py-1.5 font-bold typo-footnote',
          value === option.value
            ? 'bg-background-default text-text-primary'
            : 'text-text-tertiary',
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const COUNTER_OPTIONS: { value: CounterStyle; label: string }[] = [
  { value: 'x', label: 'X style' },
  { value: 'today', label: 'Today’s style' },
];

const formatCounts = (
  { upvotes, comments, views }: (typeof COUNTS)[CountKey],
  rule: boolean,
): string =>
  [upvotes, comments, views]
    .map((value) => largeNumberFormat(countValue(value, rule)))
    .join(' · ');

const SmallScreens = (): ReactElement => {
  const [rule, setRule] = useState(true);
  const [counter, setCounter] = useState<CounterStyle>('x');
  const { results, heights } = useFrameReports();
  const base = { rule, counter, closeUp: false };
  const frames = OPTION_ORDER.flatMap((option) =>
    WIDTHS.map((width) => frameKey({ ...base, option }, width)),
  );
  const isLoaded = useLoadQueue(frames, heights);

  return (
    <div className="min-h-screen bg-background-default p-6 tablet:p-10">
      <div className="flex max-w-[75rem] flex-col gap-10">
        <header className="flex flex-col gap-3">
          <p className="font-bold uppercase text-text-tertiary typo-caption1">
            Which bar do small phones get in list_card_large_actions?
          </p>
          <h1 className="font-bold text-text-primary typo-title1">
            Big counts on small screens
          </h1>
          <p className="max-w-[50rem] text-text-secondary typo-body">
            Goal: start the experiment without anyone in the treatment seeing
            buttons that touch or run off the screen. Metric: the smallest gap
            between two buttons in the bar, measured live in each phone below.
            Under {HEALTHY_GAP}px is flagged.
          </p>
          <p className="max-w-[50rem] text-text-tertiary typo-callout">
            Counts are upvotes · comments · views:{' '}
            {COUNT_ORDER.map(
              (key) =>
                `${COUNTS[key].label} ${formatCounts(COUNTS[key], rule)}`,
            ).join(', ')}
            . Buttons never shrink, so nothing draws on top of another button; a
            long number pushes the bar wider instead. Cover images are hidden to
            keep the phones short; the bar is the same.
          </p>
        </header>

        <section className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="font-bold text-text-primary typo-callout">
                Number rule: whole numbers from 10K
              </h2>
              <p className="text-text-tertiary typo-footnote">
                One decimal only under 10 in its unit, always rounded down, as X
                does. Every option below uses it.
              </p>
            </div>
            <Segmented
              value={rule}
              onChange={setRule}
              options={[
                { value: true, label: 'Number rule' },
                { value: false, label: 'Today’s format' },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-text-secondary typo-footnote">
            {RULE_EXAMPLES.map((value) => (
              <span key={value}>
                {value.toLocaleString('en-US')}:{' '}
                <span className="text-text-tertiary line-through">
                  {largeNumberFormat(value)}
                </span>{' '}
                <span className="font-bold text-text-primary">
                  {largeNumberFormat(roundDownForRule(value))}
                </span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtlest-tertiary pt-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-bold text-text-primary typo-callout">
                Counter spacing
              </h2>
              <p className="text-text-tertiary typo-footnote">
                Every option uses the X style: 18px icons on the 32px bar (from
                20px), and the number 4px from the icon at regular weight,
                instead of 6px (24px bar) or 8px (32px bar) at medium. See
                “Counter spacing vs X” for close-ups.
              </p>
            </div>
            <Segmented
              value={counter}
              onChange={setCounter}
              options={COUNTER_OPTIONS}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-text-primary typo-title3">Pick one</h2>
          <Scoreboard results={results} base={base} />
        </section>

        {OPTION_ORDER.map((option, optionIndex) => {
          const config = OPTIONS[option];
          return (
            <section
              key={option}
              className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-8"
            >
              <div className="flex max-w-[50rem] flex-col gap-1">
                <p className="font-bold text-text-tertiary typo-caption1">
                  {config.tag}
                </p>
                <h2 className="font-bold text-text-primary typo-title3">
                  {config.name}
                </h2>
                <p className="text-text-secondary typo-callout">
                  {config.what}
                </p>
                <p className="text-text-tertiary typo-callout">{config.cost}</p>
              </div>
              <div className="flex flex-wrap items-start gap-6">
                {WIDTHS.map((width, widthIndex) => {
                  const key = frameKey({ ...base, option }, width);
                  return (
                    <Phone
                      key={key}
                      args={{ ...base, option }}
                      width={width}
                      label={`${width}px`}
                      height={heights[key]}
                      isLoaded={isLoaded(
                        optionIndex * WIDTHS.length + widthIndex,
                      )}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

const SPEC_ROWS: { label: string; x: string; today: string; next: string }[] = [
  {
    label: 'Icon to number',
    x: '4px',
    today: '6px (24px bar), 8px (32px bar)',
    next: '4px on both bars',
  },
  {
    label: 'Number size',
    x: '13px',
    today: '13px (typo-footnote)',
    next: '13px, unchanged',
  },
  {
    label: 'Number weight',
    x: '400 regular',
    today: '500 medium',
    next: '400 regular',
  },
  {
    label: 'Numerals',
    x: 'Tabular',
    today: 'Tabular',
    next: 'Tabular, unchanged',
  },
  {
    label: 'Icon',
    x: '18.75px',
    today: '16px (24px bar), 20px (32px bar)',
    next: '16px (24px bar), 18px (32px bar)',
  },
  {
    label: 'Hover',
    x: '36px pill around icon and number',
    today: 'Square on the icon; the number sits 2px outside it',
    next: 'Square on the icon; on the 32px bar the number overlaps it by 3px',
  },
  {
    label: 'Rounding',
    x: 'Down: 2,890 reads 2.8K, 34,993 reads 34K',
    today: 'Nearest: 150,900 reads 150.9K',
    next: 'Number rule: down, whole from 10K',
  },
];

// Measured on x.com (desktop web, Oct 30, 2026) and on these stories. On our
// bar the number's label is part of the tap area: it forwards the click.
const TAP_COLUMNS = [
  'X',
  'Control 24px, today',
  'Treatment 32px, today’s style',
  'Treatment 32px, X style',
];

const TAP_ROWS: { label: string; values: string[] }[] = [
  {
    label: 'Tap height',
    values: ['36px', '24px', '32px', '32px'],
  },
  {
    label: 'Button without a number',
    values: ['38.75 × 36', '24 × 24', '32 × 32', '32 × 32'],
  },
  {
    label: 'Button with a number',
    values: [
      '67–74 × 36 (34K, 2.8K, 4.7M)',
      '35–59 × 24',
      '43–67 × 32',
      '38–61 × 32',
    ],
  },
  {
    label: 'Number is tappable',
    values: [
      'Yes: it’s inside the button, and the pill shows it',
      'Yes: its label forwards the tap, but the hover covers only the icon',
      'Yes: its label forwards the tap, but the hover covers only the icon',
      'Yes: its label forwards the tap, but the hover covers only the icon',
    ],
  },
  {
    label: 'Viral counts (1.2K · 345 · 999K)',
    values: [
      '71–74 × 36 (2.8K, 4.7M)',
      '50–59 × 24',
      '58–67 × 32',
      '53–61 × 32',
    ],
  },
  {
    label: 'Tap target vs row',
    values: [
      '36px targets in a 20px row: 8px above and below the bar is a tap',
      'Fits the 24px row',
      'Row grows to 32px, nothing outside the bar',
      'Row grows to 32px, nothing outside the bar',
    ],
  },
  {
    label: 'Hover and pressed shape',
    values: [
      'Pill around icon and number',
      'Square on the icon',
      'Square on the icon',
      'Square on the icon, the number overlaps it by 3px',
    ],
  },
  {
    label: 'Space between buttons',
    values: ['Not tappable', 'Not tappable', 'Not tappable', 'Not tappable'],
  },
  {
    label: 'WCAG 2.5.8 minimum (24px)',
    values: ['Yes', 'Yes, exactly', 'Yes', 'Yes'],
  },
  {
    label: 'Apple / Material (44 / 48px)',
    values: ['No', 'No', 'No', 'No'],
  },
];

const SPACING_COLUMNS: { label: string; args: FrameArgs }[] = [
  {
    label: 'Control 24px, today’s style',
    args: { option: 'control', rule: true, counter: 'today', closeUp: false },
  },
  {
    label: 'Control 24px, X style',
    args: { option: 'control', rule: true, counter: 'x', closeUp: false },
  },
  {
    label: 'Treatment 32px, today’s style',
    args: { option: 'a', rule: true, counter: 'today', closeUp: false },
  },
  {
    label: 'Treatment 32px, X style',
    args: { option: 'a', rule: true, counter: 'x', closeUp: false },
  },
];

const SPACING_WIDTH = 375;

const CounterSpacing = (): ReactElement => {
  const { results, heights } = useFrameReports();
  const closeUps = SPACING_COLUMNS.map((column) => ({
    ...column,
    args: { ...column.args, closeUp: true },
  }));
  const frames = [...closeUps, ...SPACING_COLUMNS];
  const isLoaded = useLoadQueue(
    frames.map(({ args }) => frameKey(args, SPACING_WIDTH)),
    heights,
  );

  return (
    <div className="min-h-screen bg-background-default p-6 tablet:p-10">
      <div className="flex max-w-[100rem] flex-col gap-10">
        <header className="flex max-w-[50rem] flex-col gap-3">
          <p className="font-bold uppercase text-text-tertiary typo-caption1">
            Should the counters sit closer to their icons, like X?
          </p>
          <h1 className="font-bold text-text-primary typo-title1">
            Counter spacing vs X
          </h1>
          <p className="text-text-secondary typo-body">
            X’s numbers sit 4px from 18.75px icons at regular weight. Ours sit 6
            to 8px away at medium, next to 20px icons on the 32px bar, so each
            counted button is wider and the number reads detached from its icon.
            Measured on x.com on Oct 30, 2026. All cards use the number rule.
          </p>
        </header>

        <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
          <table className="w-full text-left typo-footnote">
            <thead>
              <tr className="text-text-tertiary">
                <th className="p-3 font-normal" />
                <th className="p-3 font-normal">X</th>
                <th className="p-3 font-normal">daily.dev today</th>
                <th className="p-3 font-normal">X style variation</th>
              </tr>
            </thead>
            <tbody>
              {SPEC_ROWS.map((row) => (
                <tr
                  key={row.label}
                  className="border-t border-border-subtlest-tertiary"
                >
                  <td className="p-3 font-bold text-text-primary">
                    {row.label}
                  </td>
                  <td className="p-3 text-text-secondary">{row.x}</td>
                  <td className="p-3 text-text-secondary">{row.today}</td>
                  <td className="p-3 text-text-primary">{row.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold text-text-primary typo-title3">
              Tap area
            </h2>
            <p className="max-w-[50rem] text-text-tertiary typo-callout">
              Width × height in px of what a finger can hit, number included. X
              is bigger because its targets reach outside the bar, the overlap
              that got the first list version of #6836 reverted. Matching X’s
              36px without that overlap adds 4px to every card.
            </p>
          </div>
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full text-left typo-footnote">
              <thead>
                <tr className="text-text-tertiary">
                  <th className="p-3 font-normal" />
                  {TAP_COLUMNS.map((column) => (
                    <th key={column} className="p-3 font-normal">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TAP_ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className="border-t border-border-subtlest-tertiary"
                  >
                    <td className="p-3 font-bold text-text-primary">
                      {row.label}
                    </td>
                    {row.values.map((value, index) => (
                      <td
                        key={TAP_COLUMNS[index]}
                        className={classNames(
                          'p-3',
                          index === TAP_COLUMNS.length - 1
                            ? 'text-text-primary'
                            : 'text-text-secondary',
                        )}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold text-text-primary typo-title3">
              Close-up at 2x, upvote hovered
            </h2>
            <p className="text-text-tertiary typo-callout">
              The hover square shows where the number now overlaps the button.
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            {closeUps.map(({ label, args }, index) => {
              const key = frameKey(args, SPACING_WIDTH);
              return (
                <Phone
                  key={key}
                  args={args}
                  width={SPACING_WIDTH}
                  label={label}
                  height={heights[key]}
                  isLoaded={isLoaded(index)}
                  scale={2}
                />
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold text-text-primary typo-title3">
              List mode at {SPACING_WIDTH}px
            </h2>
            <p className="text-text-tertiary typo-callout">
              The four count cases from the small-screens page, with the
              smallest gap between buttons on each card.
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            {SPACING_COLUMNS.map(({ label, args }, index) => {
              const key = frameKey(args, SPACING_WIDTH);
              return (
                <div key={key} className="flex flex-col gap-2">
                  <Phone
                    args={args}
                    width={SPACING_WIDTH}
                    label={label}
                    height={heights[key]}
                    isLoaded={isLoaded(closeUps.length + index)}
                  />
                  <span className="flex items-center gap-2 text-text-tertiary typo-caption1">
                    Worst case <Badge measure={worstOf(results[key])} />
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export const SmallScreensDecision: StoryObj = {
  name: 'Small screens: pick an option',
  parameters: { options: { showPanel: false } },
  render: () => <SmallScreens />,
};

export const CounterSpacingVsX: StoryObj = {
  name: 'Counter spacing vs X',
  parameters: { options: { showPanel: false } },
  render: () => <CounterSpacing />,
};

export const Frame: StoryObj<FrameArgs> = {
  name: 'Small screens frame',
  tags: ['!dev'],
  args: { option: 'a', rule: true, counter: 'x', closeUp: false },
  argTypes: {
    option: { control: 'inline-radio', options: OPTION_ORDER },
    counter: { control: 'inline-radio', options: ['today', 'x'] },
  },
  render: (args) => <FrameCards {...args} />,
};
