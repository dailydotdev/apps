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
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
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

type BarIconSize = 18 | 20;

const Column = ({
  on,
  counter,
  icons,
  children,
}: {
  on: boolean;
  counter: CounterStyle;
  icons: BarIconSize;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div>
      <p className="font-bold text-text-primary typo-callout">
        {on ? 'Treatment' : 'Control'}
      </p>
      <p className="text-text-tertiary typo-caption1">
        {on ? '32px buttons' : 'Today: 24px buttons'}
        {on && `, ${counter === 'x' ? icons : 20}px icons`}
        {!on && ', 16px icons'}
        {counter === 'x' && ', numbers 4px from the icon'}
      </p>
    </div>
    <FeatureOverrides values={{ [featureListCardLargeActions.id]: on }}>
      <div
        data-counter={counter}
        data-large={on}
        data-fix={listFix(counter, icons)}
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
  icons: BarIconSize;
}

const ListCards = ({ show, counter, icons }: ListArgs): ReactElement => (
  <div className="min-h-screen bg-background-default p-4 tablet:p-8">
    <style>{X_COUNTER_CSS}</style>
    <style>{FIX_CSS}</style>
    <div className="flex flex-col gap-10 laptop:flex-row">
      {[false, true]
        .filter((on) => show === 'both' || (show === 'treatment') === on)
        .map((on) => (
          <Column key={String(on)} on={on} counter={counter} icons={icons}>
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
  args: { show: 'both', counter: 'x', icons: 18 },
  argTypes: {
    show: {
      control: 'inline-radio',
      options: ['both', 'control', 'treatment'],
    },
    counter: { control: 'inline-radio', options: ['x', 'today'] },
    icons: { control: 'inline-radio', options: [18, 20] },
  },
  render: (args) => <ListCards {...args} />,
};

export const List20: StoryObj<ListArgs> = {
  ...List,
  name: 'List cards, 20px icons',
  args: { ...List.args, icons: 20 },
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
    cost: 'The pick. Shipped in #7127 with the X style and two rules that keep 320px green: no padding after the number, and the upvote icon on the text edge.',
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

// largeNumberFormat ships the rule in #7127; `before` is what it printed.
const RULE_EXAMPLES = [
  { value: 1790, before: '1.8K' },
  { value: 9940, before: '9.9K' },
  { value: 23400, before: '23.4K' },
  { value: 150900, before: '150.9K' },
  { value: 1250000, before: '1.3M' },
];

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
  /** Bar fixes for the 320px worst case, joined by `-`: pad, edge. */
  fix?: string;
}

// The treatment bar ships the X style (18px icons, the number 4px away at
// regular weight) with both 320px rules: no padding after the number, and the
// upvote icon on the card's text edge. These rules rebuild what the pages
// compare it with: the X style on the 24px control bar, and the treatment bar
// as it was before (`today`, or a `fix` without `pad` or `edge`).
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
  [data-counter='x'][data-large='false'] .btn-quaternary > label {
    padding-left: 0 !important;
    font-weight: 400 !important;
  }
  [data-counter='today'][data-large='true'] .btn-quaternary > label {
    padding-left: 0.125rem !important;
    margin-left: 0 !important;
    font-weight: 500 !important;
  }
  [data-counter='today'][data-large='true'] :is(${BAR_BUTTONS}) svg {
    width: 1.25rem !important;
    height: 1.25rem !important;
  }
`;

const FIX_CSS = `
  [data-large='true']:not([data-fix*='pad']) .btn-quaternary > label {
    padding-right: 0.125rem !important;
  }
  [data-large='true']:not([data-fix*='edge'])
    div:has(> div.flex-1 > .btn-quaternary [id$='-upvote-btn']) {
    margin-left: 0 !important;
  }
  [data-large='true'][data-fix*='icon20'] :is(${BAR_BUTTONS}) svg {
    width: 1.25rem !important;
    height: 1.25rem !important;
  }
  [data-counter='x'][data-large='true'][data-fix*='icon20']
    .btn-quaternary > label {
    margin-left: -0.125rem !important;
  }
  [data-large='true'][data-fix*='icon20'][data-fix*='edge']
    div:has(> div.flex-1 > .btn-quaternary [id$='-upvote-btn']) {
    margin-left: -0.375rem !important;
  }
`;

const SHIPPED_FIX = 'pad-edge';

const listFix = (counter: CounterStyle, icons: BarIconSize): string => {
  if (counter !== 'x') {
    return 'none';
  }
  return icons === 20 ? `${SHIPPED_FIX}-icon20` : SHIPPED_FIX;
};

const frameKey = (args: FrameArgs, width: number): string =>
  [
    args.option,
    args.rule,
    args.counter,
    args.closeUp,
    args.fix ?? 'none',
    width,
  ].join('@');

const FrameCards = (args: FrameArgs): ReactElement => {
  const { option, rule, counter, closeUp, fix = 'none' } = args;
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
  }, [option, rule, counter, closeUp, fix]);

  return (
    <FeatureOverrides values={{ [featureListCardLargeActions.id]: large }}>
      <div
        ref={ref}
        data-counter={counter}
        data-large={large}
        data-fix={fix}
        className="flex flex-col bg-background-default"
      >
        <style>{'img[alt="Post Cover image"]{display:none}'}</style>
        <style>{X_COUNTER_CSS}</style>
        <style>{FIX_CSS}</style>
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

const frameSrc = ({
  option,
  rule,
  counter,
  closeUp,
  fix = 'none',
}: FrameArgs): string =>
  `iframe.html?id=${FRAME_ID}&viewMode=story&args=option:${option};rule:!${rule};counter:${counter};closeUp:!${closeUp};fix:${fix}&globals=theme:dark`;

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
  // A frame whose module import failed shows Storybook's error: load it again.
  const [attempt, setAttempt] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const isReported = height !== undefined;
  const frameHeight = height ?? (args.closeUp ? 200 : 900);

  useEffect(() => {
    if (!isLoaded || isReported) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      const text = frameRef.current?.contentDocument?.body?.innerText ?? '';
      if (text.includes('Failed to fetch dynamically imported module')) {
        setAttempt((a) => a + 1);
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [isLoaded, isReported]);

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
            ref={frameRef}
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
  const rule = true;
  const [counter, setCounter] = useState<CounterStyle>('x');
  const { results, heights } = useFrameReports();
  const base = {
    rule,
    counter,
    closeUp: false,
    fix: counter === 'x' ? SHIPPED_FIX : 'none',
  };
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
                does. Shipped in #7127 for every counter in the app.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-text-secondary typo-footnote">
            {RULE_EXAMPLES.map(({ value, before }) => (
              <span key={value}>
                {value.toLocaleString('en-US')}:{' '}
                <span className="text-text-tertiary line-through">
                  {before}
                </span>{' '}
                <span className="font-bold text-text-primary">
                  {largeNumberFormat(value)}
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
  'Treatment 32px, shipped in #7127',
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
      '36–59 × 32',
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
      '51–59 × 32',
    ],
  },
  {
    label: 'Tap target vs row',
    values: [
      '36px targets in a 20px row: 8px above and below the bar is a tap',
      'Fits the 24px row',
      'Row grows to 32px, nothing outside the bar',
      'Row grows to 32px; the upvote button reaches 7px into the card padding, never past the card',
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
    args: {
      option: 'control',
      rule: true,
      counter: 'x',
      closeUp: false,
      fix: SHIPPED_FIX,
    },
  },
  {
    label: 'Treatment 32px, today’s style',
    args: { option: 'a', rule: true, counter: 'today', closeUp: false },
  },
  {
    label: 'Treatment 32px, X style',
    args: {
      option: 'a',
      rule: true,
      counter: 'x',
      closeUp: false,
      fix: SHIPPED_FIX,
    },
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
                <th className="p-3 font-normal">Shipped in #7127</th>
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

const FIXES: {
  key: string;
  tag: string;
  name: string;
  what: string;
  cost: string;
}[] = [
  {
    key: 'none',
    tag: 'Before',
    name: 'Option A before the rules',
    what: '32px on every width, the number rule and the X style.',
    cost: 'The worst case at 320px is just under the 4px line.',
  },
  {
    key: 'pad',
    tag: '1',
    name: 'No padding after the number',
    what: 'Every counter drops the 2px after its number. The space between buttons already separates them.',
    cost: 'None visible. A general rule for every counter on the bar.',
  },
  {
    key: 'edge',
    tag: '2',
    name: 'Line the upvote icon up with the text',
    what: 'The upvote icon lines up with the title instead of its button edge, so the button reaches 7px into the card padding. The views number on the right already ends on the text edge.',
    cost: 'None at rest. On hover the upvote square sits 7px outside the text edge. A general rule: optical alignment.',
  },
  {
    key: 'pad-edge',
    tag: '1 + 2',
    name: 'Both rules (shipped in #7127)',
    what: 'No padding after the number, and the upvote icon lines up with the text.',
    cost: 'Both costs above, both invisible at rest.',
  },
];

const FIX_BASE: Omit<FrameArgs, 'fix'> = {
  option: 'a',
  rule: true,
  counter: 'x',
  closeUp: false,
};

const OptionAGreen = (): ReactElement => {
  const { results, heights } = useFrameReports();
  const frames = FIXES.flatMap(({ key }) =>
    WIDTHS.map((width) => frameKey({ ...FIX_BASE, fix: key }, width)),
  );
  const isLoaded = useLoadQueue(frames, heights);

  return (
    <div className="min-h-screen bg-background-default p-6 tablet:p-10">
      <div className="flex max-w-[75rem] flex-col gap-10">
        <header className="flex max-w-[50rem] flex-col gap-3">
          <p className="font-bold uppercase text-text-tertiary typo-caption1">
            How does option A get green at 320px?
          </p>
          <h1 className="font-bold text-text-primary typo-title1">
            Option A: every width green
          </h1>
          <p className="text-text-secondary typo-body">
            Goal: keep 32px buttons on every phone, with the number rule and the
            X style, and get the worst case (99K · 9.9K · 999K) to a gap of{' '}
            {HEALTHY_GAP}px or more at 320px. Metric: the smallest gap between
            two buttons, measured live. Each fix is a general rule for the bar,
            not a 320px exception.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-text-primary typo-title3">Results</h2>
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full text-left typo-footnote">
              <thead>
                <tr className="text-text-tertiary">
                  <th className="p-3 font-normal">Fix</th>
                  {WIDTHS.map((width) => (
                    <th key={width} className="p-3 font-normal">
                      Worst case at {width}px
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIXES.map((fix) => (
                  <tr
                    key={fix.key}
                    className="border-t border-border-subtlest-tertiary"
                  >
                    <td className="p-3 text-text-primary">
                      <span className="mr-2 font-bold">{fix.tag}</span>
                      {fix.name}
                    </td>
                    {WIDTHS.map((width) => (
                      <td key={width} className="p-3">
                        <Badge
                          measure={worstOf(
                            results[
                              frameKey({ ...FIX_BASE, fix: fix.key }, width)
                            ],
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {FIXES.map((fix, fixIndex) => (
          <section
            key={fix.key}
            className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-8"
          >
            <div className="flex max-w-[50rem] flex-col gap-1">
              <p className="font-bold text-text-tertiary typo-caption1">
                {fix.tag}
              </p>
              <h2 className="font-bold text-text-primary typo-title3">
                {fix.name}
              </h2>
              <p className="text-text-secondary typo-callout">{fix.what}</p>
              <p className="text-text-tertiary typo-callout">{fix.cost}</p>
            </div>
            <div className="flex flex-wrap items-start gap-6">
              {WIDTHS.map((width, widthIndex) => {
                const args = { ...FIX_BASE, fix: fix.key };
                const key = frameKey(args, width);
                return (
                  <Phone
                    key={key}
                    args={args}
                    width={width}
                    label={`${width}px`}
                    height={heights[key]}
                    isLoaded={isLoaded(fixIndex * WIDTHS.length + widthIndex)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

// Grid cards: the list decisions applied to the grid bar, one step at a time.
// x: the number 4px from the icon at regular weight. icon18: 18px bar icons.
// pad: no padding after the number. edge: the bar lines up with the text:
// with 18px icons, 9px before the upvote button and 16px after the views
// number put both on the title's edges. left: only the upvote icon moves.
const GRID_BAR = `div.py-0\\.5`;

const GRID_CSS = `
  [data-grid~='x'] ${GRID_BAR} .btn-quaternary > label {
    padding-left: 0 !important;
    margin-left: -0.125rem;
    font-weight: 400 !important;
  }
  [data-grid~='x'][data-grid~='icon18'] ${GRID_BAR} .btn-quaternary > label {
    margin-left: -0.1875rem;
  }
  [data-grid~='icon18'] ${GRID_BAR} :is(${BAR_BUTTONS}) svg {
    width: 1.125rem !important;
    height: 1.125rem !important;
  }
  [data-grid~='pad'] ${GRID_BAR} .btn-quaternary > label {
    padding-right: 0 !important;
  }
  :is([data-grid~='edge'], [data-grid~='left']) ${GRID_BAR} {
    padding-left: 0.5625rem !important;
  }
  [data-grid~='edge'] ${GRID_BAR} {
    padding-right: 1rem !important;
  }
  [data-grid~='left20'] ${GRID_BAR} {
    padding-left: 0.625rem !important;
  }
`;

const GRID_WIDTHS = [272, 300, 340];

const GRID_STEPS: {
  key: string;
  tag: string;
  name: string;
  what: string;
}[] = [
  {
    key: '',
    tag: 'Today',
    name: 'Grid bar today',
    what: '32px buttons, 20px icons, the number 8px from the icon at medium weight, 2px after it. Bookmark in the header, from the card_save_on_hover win. The number rule already applies: it ships in largeNumberFormat.',
  },
  {
    key: 'x',
    tag: 'G1',
    name: 'Number 4px from the icon, regular weight',
    what: 'The X style the list treatment ships.',
  },
  {
    key: 'x icon18',
    tag: 'G2',
    name: 'G1 + 18px icons',
    what: 'The bar icons match the list treatment and X (18.75px). Buttons stay 32px.',
  },
  {
    key: 'x icon18 pad',
    tag: 'G3',
    name: 'G2 + no padding after the number',
    what: 'The first of the two 320px rules from the list.',
  },
  {
    key: 'x icon18 pad left',
    tag: 'G4 · Recommended',
    name: 'G3 + the upvote icon lines up with the text',
    what: 'The upvote icon moves onto the title’s left edge, as on the list. The views number keeps today’s right padding, 6px past the text. Every list decision, green at 272px.',
  },
  {
    key: 'x icon18 pad edge',
    tag: 'G5',
    name: 'G3 + both ends line up with the text',
    what: 'The second rule: the upvote icon and the views number line up with the title’s edges, as on the list. On grid the bar today runs past the text on both sides, so this pulls it in and costs width.',
  },
];

const measureGridBar = (card: HTMLElement): Measure | null => {
  const measure = measureBar(card);
  if (!measure) {
    return null;
  }
  const bar = card
    .querySelector('[id$="-upvote-btn"]')
    ?.closest<HTMLElement>('div.flex-1');
  const right = Math.max(
    ...Array.from(bar?.children ?? []).map(
      (child) => child.getBoundingClientRect().right,
    ),
  );
  return {
    gap: measure.gap,
    offscreen: Math.max(0, right - card.getBoundingClientRect().right),
  };
};

const GridStep = ({
  step,
  onMeasure,
}: {
  step: (typeof GRID_STEPS)[number];
  onMeasure: (key: string, measures: Record<string, Measure | null>) => void;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [measures, setMeasures] = useState<Record<string, Measure | null>>({});

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) {
      return undefined;
    }
    const measure = () => {
      const next = Object.fromEntries(
        Array.from(root.querySelectorAll<HTMLElement>('[data-grid-card]')).map(
          (card) => [card.dataset.gridCard, measureGridBar(card)],
        ),
      );
      setMeasures(next);
      onMeasure(step.key, next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.key]);

  return (
    <div ref={ref} data-grid={step.key} className="flex flex-col gap-6">
      {GRID_WIDTHS.map((width) => (
        <div key={width} className="flex flex-col gap-2">
          <span className="font-bold text-text-tertiary typo-caption1">
            {width}px card
          </span>
          <div className="flex flex-wrap items-start gap-4">
            {COUNT_ORDER.map((key) => {
              const count = COUNTS[key];
              const cardPost = {
                ...article,
                id: `grid-${key}-${width}`,
                numUpvotes: count.upvotes,
                numComments: count.comments,
                analytics: { impressions: count.views },
              } as Post;
              const caseKey = `${key}@${width}`;
              return (
                <div
                  key={key}
                  className="flex flex-col gap-2"
                  style={{ width }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-secondary typo-caption1">
                      {count.label}
                    </span>
                    <Badge measure={measures[caseKey]} />
                  </div>
                  <div data-grid-card={caseKey} className="grid">
                    <ArticleGrid post={cardPost} {...handlers} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const GRID_DECISIONS: {
  decision: string;
  list: string;
  grid: string;
  next: string;
}[] = [
  {
    decision: 'Number rule',
    list: 'Shipped',
    grid: 'Gets it from largeNumberFormat in #7127',
    next: 'Nothing to do',
  },
  {
    decision: 'Button size',
    list: '32px',
    grid: '32px',
    next: 'Already matches',
  },
  {
    decision: 'Icon size',
    list: '18px',
    grid: '20px',
    next: '18px (G2)',
  },
  {
    decision: 'Icon to number',
    list: '4px, regular weight',
    grid: '8px, medium weight',
    next: '4px, regular weight (G1)',
  },
  {
    decision: 'Padding after the number',
    list: 'None',
    grid: '2px',
    next: 'None (G3)',
  },
  {
    decision: 'Bar edges',
    list: 'Upvote icon on the text edge',
    grid: 'Upvote icon 6px left of the title, views number 4px past it',
    next: 'Upvote icon on the title’s edge (G4). Both ends (G5) goes red at 272px',
  },
  {
    decision: 'Bookmark',
    list: 'In the bar (list cards weren’t in the header test)',
    grid: 'In the header, between Read post and ⋯ (won)',
    next: 'Keep it in the header',
  },
  {
    decision: 'Header icon buttons',
    list: 'Read post (icon-only on phones) and ⋯ side by side',
    grid: 'Bookmark and ⋯ side by side',
    next: 'Already matches',
  },
];

const GridCards = (): ReactElement => {
  const [results, setResults] = useState<
    Record<string, Record<string, Measure | null>>
  >({});
  const onMeasure = (
    key: string,
    measures: Record<string, Measure | null>,
  ): void => setResults((prev) => ({ ...prev, [key]: measures }));

  return (
    <div className="min-h-screen bg-background-default p-6 tablet:p-10">
      <style>{GRID_CSS}</style>
      <div className="flex flex-col gap-10">
        <header className="flex max-w-[50rem] flex-col gap-3">
          <p className="font-bold uppercase text-text-tertiary typo-caption1">
            What should grid cards change to match the list?
          </p>
          <h1 className="font-bold text-text-primary typo-title1">
            Grid cards: match the list decisions
          </h1>
          <p className="text-text-secondary typo-body">
            Goal: one action bar language on grid and list cards. The list
            treatment in #7127 ships the number rule, the X style (18px icons,
            the number 4px away at regular weight) and two spacing rules. The
            grid keeps the bookmark in the header, where it won. Metric: the
            smallest gap between bar buttons at the narrowest grid card (272px),
            measured live. Under {HEALTHY_GAP}px is flagged.
          </p>
          <p className="text-text-secondary typo-body">
            Recommendation: G4. Today’s grid bar is already red at 272px with
            the worst-case counts. The list’s counter changes fix it, and lining
            the upvote icon up with the title matches the list’s rule while
            staying green.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-text-primary typo-title3">
            Decision by decision
          </h2>
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full text-left typo-footnote">
              <thead>
                <tr className="text-text-tertiary">
                  <th className="p-3 font-normal">Decision</th>
                  <th className="p-3 font-normal">List treatment (#7127)</th>
                  <th className="p-3 font-normal">Grid today</th>
                  <th className="p-3 font-normal">Grid recommendation</th>
                </tr>
              </thead>
              <tbody>
                {GRID_DECISIONS.map((row) => (
                  <tr
                    key={row.decision}
                    className="border-t border-border-subtlest-tertiary"
                  >
                    <td className="p-3 font-bold text-text-primary">
                      {row.decision}
                    </td>
                    <td className="p-3 text-text-secondary">{row.list}</td>
                    <td className="p-3 text-text-secondary">{row.grid}</td>
                    <td className="p-3 text-text-primary">{row.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-text-primary typo-title3">Results</h2>
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full text-left typo-footnote">
              <thead>
                <tr className="text-text-tertiary">
                  <th className="p-3 font-normal">Step</th>
                  {GRID_WIDTHS.map((width) => (
                    <th key={width} className="p-3 font-normal">
                      Worst case at {width}px
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRID_STEPS.map((step) => (
                  <tr
                    key={step.key}
                    className="border-t border-border-subtlest-tertiary"
                  >
                    <td className="p-3 text-text-primary">
                      <span className="mr-2 font-bold">{step.tag}</span>
                      {step.name}
                    </td>
                    {GRID_WIDTHS.map((width) => (
                      <td key={width} className="p-3">
                        <Badge
                          measure={worstOf(
                            results[step.key] &&
                              Object.fromEntries(
                                Object.entries(results[step.key]).filter(
                                  ([key]) => key.endsWith(`@${width}`),
                                ),
                              ),
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {GRID_STEPS.map((step) => (
          <section
            key={step.key}
            className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-8"
          >
            <div className="flex max-w-[50rem] flex-col gap-1">
              <p className="font-bold text-text-tertiary typo-caption1">
                {step.tag}
              </p>
              <h2 className="font-bold text-text-primary typo-title3">
                {step.name}
              </h2>
              <p className="text-text-secondary typo-callout">{step.what}</p>
            </div>
            <GridStep step={step} onMeasure={onMeasure} />
          </section>
        ))}
      </div>
    </div>
  );
};

// 18px (shipped) or 20px icons on the 32px bar. With 20px icons the number
// keeps its 4px (-2px over the button padding instead of -3px), and lining the
// upvote icon up with the text takes 6px instead of 7px.
const ICON_SIZES = [
  { size: 18, label: '18px icons (shipped)', fix: SHIPPED_FIX },
  { size: 20, label: '20px icons', fix: `${SHIPPED_FIX}-icon20` },
];

const GRID_ICON_STEPS = [
  {
    key: 'x icon18 pad left',
    tag: '18px',
    name: 'Grid G4 with 18px icons',
    what: 'The recommendation on the grid page.',
  },
  {
    key: 'x pad left20',
    tag: '20px',
    name: 'Grid G4 with 20px icons',
    what: 'Today’s grid icon size, with every other list decision.',
  },
];

const ICON_BASE: Omit<FrameArgs, 'fix'> = {
  option: 'a',
  rule: true,
  counter: 'x',
  closeUp: false,
};

const IconSizeDecision = (): ReactElement => {
  const { results, heights } = useFrameReports();
  const [gridResults, setGridResults] = useState<
    Record<string, Record<string, Measure | null>>
  >({});
  const closeUps = ICON_SIZES.map(({ fix }) => ({
    ...ICON_BASE,
    fix,
    closeUp: true,
  }));
  const frames = [
    ...closeUps.map((args) => frameKey(args, 375)),
    ...ICON_SIZES.flatMap(({ fix }) =>
      WIDTHS.map((width) => frameKey({ ...ICON_BASE, fix }, width)),
    ),
  ];
  const isLoaded = useLoadQueue(frames, heights);
  const onGridMeasure = (
    key: string,
    measures: Record<string, Measure | null>,
  ): void => setGridResults((prev) => ({ ...prev, [key]: measures }));
  const gridWorst = (key: string, width: number) =>
    worstOf(
      gridResults[key] &&
        Object.fromEntries(
          Object.entries(gridResults[key]).filter(([caseKey]) =>
            caseKey.endsWith(`@${width}`),
          ),
        ),
    );

  return (
    <div className="min-h-screen bg-background-default p-6 tablet:p-10">
      <style>{GRID_CSS}</style>
      <div className="flex max-w-[90rem] flex-col gap-10">
        <header className="flex max-w-[50rem] flex-col gap-3">
          <p className="font-bold uppercase text-text-tertiary typo-caption1">
            Should the 32px bar keep 20px icons instead of 18px?
          </p>
          <h1 className="font-bold text-text-primary typo-title1">
            Icon size: 18px or 20px
          </h1>
          <p className="text-text-secondary typo-body">
            #7127 ships 18px icons on the list treatment bar, close to X’s
            18.75px. 20px is what grid cards use today. Everything else stays as
            shipped: 32px buttons, the number 4px from the icon at regular
            weight, no padding after it, and the upvote icon on the text edge.
            Metric: the smallest gap between bar buttons, measured live. Under{' '}
            {HEALTHY_GAP}px is flagged.
          </p>
          <p className="text-text-secondary typo-body">
            Recommendation: keep 18px. On the list both sizes stay green (20px
            costs about 1px of gap at every width). On grid cards, 20px drops
            the 272px worst case under the line, so 18px is the size that keeps
            one icon size on both layouts.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-text-primary typo-title3">
            What changes
          </h2>
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full text-left typo-footnote">
              <thead>
                <tr className="text-text-tertiary">
                  <th className="p-3 font-normal" />
                  <th className="p-3 font-normal">18px (shipped)</th>
                  <th className="p-3 font-normal">20px</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Icon', '18px, X uses 18.75px', '20px, as grid cards today'],
                  ['Button and tap height', '32px', '32px'],
                  ['Icon to number', '4px', '4px'],
                  ['Padding inside the button', '7px around the icon', '6px'],
                  [
                    'Counted button width',
                    'Base',
                    '1px wider: the number starts 1px later',
                  ],
                  [
                    'Upvote icon on the text edge',
                    'Bar moves 7px left',
                    'Bar moves 6px left: 1px less room',
                  ],
                ].map(([label, small, big]) => (
                  <tr
                    key={label}
                    className="border-t border-border-subtlest-tertiary"
                  >
                    <td className="p-3 font-bold text-text-primary">{label}</td>
                    <td className="p-3 text-text-secondary">{small}</td>
                    <td className="p-3 text-text-secondary">{big}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-text-primary typo-title3">Results</h2>
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full text-left typo-footnote">
              <thead>
                <tr className="text-text-tertiary">
                  <th className="p-3 font-normal">List treatment</th>
                  {WIDTHS.map((width) => (
                    <th key={width} className="p-3 font-normal">
                      Worst case at {width}px
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ICON_SIZES.map(({ label, fix }) => (
                  <tr
                    key={fix}
                    className="border-t border-border-subtlest-tertiary"
                  >
                    <td className="p-3 text-text-primary">{label}</td>
                    {WIDTHS.map((width) => (
                      <td key={width} className="p-3">
                        <Badge
                          measure={worstOf(
                            results[frameKey({ ...ICON_BASE, fix }, width)],
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full text-left typo-footnote">
              <thead>
                <tr className="text-text-tertiary">
                  <th className="p-3 font-normal">Grid G4 (proposal)</th>
                  {GRID_WIDTHS.map((width) => (
                    <th key={width} className="p-3 font-normal">
                      Worst case at {width}px
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRID_ICON_STEPS.map((step) => (
                  <tr
                    key={step.key}
                    className="border-t border-border-subtlest-tertiary"
                  >
                    <td className="p-3 text-text-primary">{step.name}</td>
                    {GRID_WIDTHS.map((width) => (
                      <td key={width} className="p-3">
                        <Badge measure={gridWorst(step.key, width)} />
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
              Close-up at 2x, 375px, upvote hovered
            </h2>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            {closeUps.map((args, index) => {
              const key = frameKey(args, 375);
              return (
                <Phone
                  key={key}
                  args={args}
                  width={375}
                  label={ICON_SIZES[index].label}
                  height={heights[key]}
                  isLoaded={isLoaded(index)}
                  scale={2}
                />
              );
            })}
          </div>
        </section>

        {ICON_SIZES.map(({ label, fix }, sizeIndex) => (
          <section
            key={fix}
            className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-8"
          >
            <h2 className="font-bold text-text-primary typo-title3">
              List treatment, {label}
            </h2>
            <div className="flex flex-wrap items-start gap-6">
              {WIDTHS.map((width, widthIndex) => {
                const args = { ...ICON_BASE, fix };
                const key = frameKey(args, width);
                return (
                  <Phone
                    key={key}
                    args={args}
                    width={width}
                    label={`${width}px`}
                    height={heights[key]}
                    isLoaded={isLoaded(
                      closeUps.length + sizeIndex * WIDTHS.length + widthIndex,
                    )}
                  />
                );
              })}
            </div>
          </section>
        ))}

        {GRID_ICON_STEPS.map((step) => (
          <section
            key={step.key}
            className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-8"
          >
            <div className="flex max-w-[50rem] flex-col gap-1">
              <h2 className="font-bold text-text-primary typo-title3">
                {step.name}
              </h2>
              <p className="text-text-secondary typo-callout">{step.what}</p>
            </div>
            <GridStep step={step} onMeasure={onGridMeasure} />
          </section>
        ))}
      </div>
    </div>
  );
};

export const IconSize18Or20: StoryObj = {
  name: 'Icon size: 18px or 20px',
  parameters: { options: { showPanel: false } },
  render: () => <IconSizeDecision />,
};

export const GridCardsMatchTheList: StoryObj = {
  name: 'Grid cards: match the list',
  parameters: { options: { showPanel: false } },
  render: () => <GridCards />,
};

export const OptionAEveryWidthGreen: StoryObj = {
  name: 'Option A: every width green',
  parameters: { options: { showPanel: false } },
  render: () => <OptionAGreen />,
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
  args: { option: 'a', rule: true, counter: 'x', closeUp: false, fix: 'none' },
  argTypes: {
    fix: { control: 'text' },
    option: { control: 'inline-radio', options: OPTION_ORDER },
    counter: { control: 'inline-radio', options: ['today', 'x'] },
  },
  render: (args) => <FrameCards {...args} />,
};
