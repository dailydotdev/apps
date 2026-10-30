import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { featureListCardLargeActions } from '@dailydotdev/shared/src/lib/featureManagement';
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
  children,
}: {
  on: boolean;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div>
      <p className="font-bold text-text-primary typo-callout">
        {on ? 'Treatment' : 'Control'}
      </p>
      <p className="text-text-tertiary typo-caption1">
        {on ? '32px buttons, 20px icons' : 'Today: 24px buttons, 16px icons'}
      </p>
    </div>
    <FeatureOverrides values={{ [featureListCardLargeActions.id]: on }}>
      <div className="flex w-full max-w-[40rem] flex-col">{children}</div>
    </FeatureOverrides>
  </div>
);

interface ListArgs {
  show: 'both' | 'control' | 'treatment';
}

const ListCards = ({ show }: ListArgs): ReactElement => (
  <div className="min-h-screen bg-background-default p-4 tablet:p-8">
    <div className="flex flex-col gap-10 laptop:flex-row">
      {[false, true]
        .filter((on) => show === 'both' || (show === 'treatment') === on)
        .map((on) => (
          <Column key={String(on)} on={on}>
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
  args: { show: 'both' },
  argTypes: {
    show: {
      control: 'inline-radio',
      options: ['both', 'control', 'treatment'],
    },
  },
  render: (args) => <ListCards {...args} />,
};

/**
 * Small screens. Big counts widen the bar, and the treatment's 32px buttons
 * leave less room between them. Each phone below is a real viewport (an
 * iframe of the Frame story), so the cards get the same breakpoints a phone
 * gets, and the gaps are measured live from the rendered bar.
 */

type OptionKey = 'control' | 'a' | 'b' | 'c' | 'd';
type CountKey = 'typical' | 'views' | 'viral' | 'worst';

const OPTIONS: Record<
  OptionKey,
  {
    tag: string;
    name: string;
    what: string;
    cost: string;
    large: boolean;
    rule: boolean;
    smallBar: boolean;
    noCopyBelow360: boolean;
  }
> = {
  control: {
    tag: 'Today',
    name: 'Control, 24px bar',
    what: 'What every list card shows today and what the control arm keeps.',
    cost: 'Baseline for comparison.',
    large: false,
    rule: false,
    smallBar: false,
    noCopyBelow360: false,
  },
  a: {
    tag: 'A',
    name: 'Ship #7127 as it is',
    what: '32px buttons on every width, numbers formatted as today.',
    cost: 'Viral posts touch at 320px and the worst case runs off the screen.',
    large: true,
    rule: false,
    smallBar: false,
    noCopyBelow360: false,
  },
  b: {
    tag: 'B',
    name: 'A + whole numbers from 10K',
    what: 'One decimal only under 10 in its unit, always rounded down: 150.9K reads 150K. Its own PR, shared by every counter in the app.',
    cost: 'Fixes 360px and up. 320px still touches in the worst case.',
    large: true,
    rule: true,
    smallBar: false,
    noCopyBelow360: false,
  },
  c: {
    tag: 'C',
    name: 'B + today’s 24px bar below 360px',
    what: 'The number rule, and phones narrower than 360px keep the control bar inside the treatment.',
    cost: '320px readers in the treatment don’t see the change. Check their share before launch.',
    large: true,
    rule: true,
    smallBar: true,
    noCopyBelow360: false,
  },
  d: {
    tag: 'D',
    name: 'B + no copy link below 360px',
    what: 'The number rule, and the copy link button leaves the bar on phones narrower than 360px. Everyone gets 32px.',
    cost: 'Copy link taps on 320px phones are lost from the card. A second change inside the treatment.',
    large: true,
    rule: true,
    smallBar: false,
    noCopyBelow360: true,
  },
};

const OPTION_ORDER: OptionKey[] = ['control', 'a', 'b', 'c', 'd'];

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

// The proposed largeNumberFormat rule, applied to the value so today's
// formatter prints it: one decimal under 10 in its unit, rounded down.
const roundDownForRule = (value: number): number => {
  if (value < 1000) {
    return value;
  }
  const unit = 1000 ** Math.floor(Math.log10(value) / 3);
  const scaled = value / unit;
  const step = scaled < 10 ? 10 : 1;
  return (Math.floor(scaled * step) / step) * unit;
};

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

interface FrameArgs {
  option: OptionKey;
}

const FrameCards = ({ option }: FrameArgs): ReactElement => {
  const config = OPTIONS[option];
  const ref = useRef<HTMLDivElement>(null);
  const [measures, setMeasures] = useState<Record<string, Measure | null>>({});
  const narrow = window.innerWidth < NARROW;
  const large = config.large && !(config.smallBar && narrow);
  const hideCopy = config.noCopyBelow360 && narrow;

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) {
      return undefined;
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
          option,
          width: window.innerWidth,
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
  }, [option]);

  return (
    <FeatureOverrides values={{ [featureListCardLargeActions.id]: large }}>
      <div ref={ref} className="flex flex-col bg-background-default">
        <style>{'img[alt="Post Cover image"]{display:none}'}</style>
        {hideCopy && <style>{'[id$="-copy-btn"]{display:none}'}</style>}
        {COUNT_ORDER.map((key) => {
          const count = COUNTS[key];
          const value = (n: number) => (config.rule ? roundDownForRule(n) : n);
          const cardPost = {
            ...article,
            id: `small-${key}`,
            numUpvotes: value(count.upvotes),
            numComments: value(count.comments),
            analytics: { impressions: value(count.views) },
          } as Post;
          return (
            <div key={key} data-case={key}>
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="font-bold text-text-secondary typo-caption1">
                  {count.label}
                </span>
                <Badge measure={measures[key]} />
              </div>
              <ArticleList post={cardPost} {...handlers} />
            </div>
          );
        })}
      </div>
    </FeatureOverrides>
  );
};

const FRAME_ID = 'experiments-list-card-large-actions--frame';

type Results = Record<string, Record<string, Measure | null>>;

const resultKey = (option: OptionKey, width: number) => `${option}@${width}`;

const Phone = ({
  option,
  width,
  height,
  isLoaded,
}: {
  option: OptionKey;
  width: number;
  height?: number;
  isLoaded: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <span className="font-bold text-text-tertiary typo-caption1">
      {width}px
    </span>
    <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary">
      {isLoaded ? (
        <iframe
          title={`${OPTIONS[option].name} at ${width}px`}
          src={`iframe.html?id=${FRAME_ID}&viewMode=story&args=option:${option}&globals=theme:dark`}
          width={width}
          height={height ?? 900}
          className="block border-0"
        />
      ) : (
        <div style={{ width, height: 900 }} />
      )}
    </div>
  </div>
);

const Scoreboard = ({ results }: { results: Results }): ReactElement => (
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
              {WIDTHS.map((width) => {
                const measures = results[resultKey(option, width)];
                const worst = measures
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
                return (
                  <td key={width} className="p-3">
                    <Badge measure={worst} />
                  </td>
                );
              })}
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

const SmallScreens = (): ReactElement => {
  const [results, setResults] = useState<Results>({});
  const [heights, setHeights] = useState<Record<string, number>>({});
  // The dev server fails module imports when 15 frames boot at once, so
  // frames load a few at a time: one more per report, or every few seconds.
  const [loadedCount, setLoadedCount] = useState(3);

  useEffect(() => {
    const timer = window.setInterval(
      () => setLoadedCount((count) => count + 1),
      4000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setLoadedCount((count) => Math.max(count, Object.keys(results).length + 3));
  }, [results]);

  useEffect(() => {
    const onMessage = ({ data }: MessageEvent) => {
      if (data?.source !== 'list-card-small-screens') {
        return;
      }
      const key = resultKey(data.option, data.width);
      setResults((prev) => ({ ...prev, [key]: data.measures }));
      setHeights((prev) => ({ ...prev, [key]: data.height }));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

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
            Counts are upvotes · comments · views: Typical 63 · 8 · 197K, Big
            views 14 · 2 · 150.9K, Viral 1.2K · 345 · 999.9K, Worst case 99.9K ·
            9.9K · 999.9K. Buttons never shrink, so nothing draws on top of
            another button; a long number pushes the bar wider instead. Cover
            images are hidden to keep the phones short; the bar is the same.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-text-primary typo-title3">Pick one</h2>
          <Scoreboard results={results} />
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
                {WIDTHS.map((width, widthIndex) => (
                  <Phone
                    key={width}
                    option={option}
                    width={width}
                    height={heights[resultKey(option, width)]}
                    isLoaded={
                      optionIndex * WIDTHS.length + widthIndex < loadedCount
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export const SmallScreensDecision: StoryObj = {
  name: 'Small screens: pick an option',
  parameters: { options: { showPanel: false } },
  render: () => <SmallScreens />,
};

export const Frame: StoryObj<FrameArgs> = {
  name: 'Small screens frame',
  tags: ['!dev'],
  args: { option: 'a' },
  argTypes: {
    option: { control: 'inline-radio', options: OPTION_ORDER },
  },
  render: (args) => <FrameCards {...args} />,
};
