import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { PostTypeToListCard } from '@dailydotdev/shared/src/components/cards/common/listCards';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import post, { sharePost } from '@dailydotdev/shared/__tests__/fixture/post';
import { pollPost } from '@dailydotdev/shared/__tests__/fixture/pollPost';
import ExtensionProviders from '../extension/_providers';

/**
 * The card action bar: production next to the final decisions, on the
 * production list and grid cards with the shared test fixtures. None of the
 * final bar is built yet, so `Arm` styles it over production: the number rule
 * on the counts, the bar sizes and spacing in FINAL_CSS, and the hover under a
 * number in toggleLabelHover.
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

type Arm = 'production' | 'final';
const ARMS: Arm[] = ['production', 'final'];

type CountKey = 'typical' | 'views' | 'viral' | 'worst';

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
const LIST_WIDTHS = [320, 360, 375];
const GRID_WIDTHS = [272, 300, 340];
const HEALTHY_GAP = 4;

// The number rule, applied to the value so today's formatter prints it: one
// decimal only under 10 in its unit, always rounded down.
const roundDown = (value: number): number => {
  if (value < 1000) {
    return value;
  }
  const unit = 1000 ** Math.floor(Math.log10(value) / 3);
  const step = value / unit < 10 ? 10 : 1;
  return (Math.floor((value / unit) * step) / step) * unit;
};

const forArm = (arm: Arm, card: Post): Post =>
  arm === 'production'
    ? card
    : ({
        ...card,
        numUpvotes: roundDown(card.numUpvotes ?? 0),
        numComments: roundDown(card.numComments ?? 0),
        analytics: { impressions: roundDown(card.analytics?.impressions ?? 0) },
      } as Post);

const finalCountsLine = COUNT_ORDER.map((key) => {
  const { label, upvotes, comments, views } = COUNTS[key];
  return `${label} ${[upvotes, comments, views]
    .map((value) => largeNumberFormat(roundDown(value)))
    .join(' · ')}`;
}).join(', ');

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
const LIST_BAR = `div:has(> div.flex-1 > .btn-quaternary [id$='-upvote-btn'])`;
const GRID_BAR = `div.py-0\\.5:has([id$='-upvote-btn'])`;

// List: 24px buttons with 16px icons become 32px with 19px icons, and the
// upvote icon, not its button, lines up with the text. Both bars: the number
// 4px from the icon at regular weight with nothing after it. Grid: 4px between
// the bar and the cover image, the card's left side and its bottom, and 8px
// after the views number, so the row stays 36px.
const FINAL_CSS = `
  [data-arm='final'] :is(${LIST_BAR}, ${GRID_BAR}) :is(${BAR_BUTTONS}) svg {
    width: 1.1875rem !important;
    height: 1.1875rem !important;
  }
  [data-arm='final'] ${LIST_BAR} :is(${BAR_BUTTONS}) {
    height: 2rem !important;
    width: 2rem !important;
    border-radius: 0.625rem !important;
  }
  [data-arm='final'] ${LIST_BAR} {
    margin-left: -0.40625rem;
  }
  [data-arm='final'] :is(${LIST_BAR}, ${GRID_BAR}) .btn-quaternary > label {
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-left: -0.15625rem;
    font-weight: 400 !important;
  }
  [data-arm='final'] ${GRID_BAR} {
    padding: 0 0.5rem 0.25rem 0.25rem !important;
  }
`;

// Production shows a button's hover under its number only for links. The
// final bar shows it for every counter.
const toggleLabelHover =
  (isHovered: boolean) =>
  ({ target }: React.MouseEvent): void => {
    (target as HTMLElement)
      .closest('.btn-quaternary > label')
      ?.previousElementSibling?.classList.toggle('hover', isHovered);
  };

const ArmScope = ({
  arm,
  className,
  children,
  innerRef,
}: {
  arm: Arm;
  className?: string;
  children: ReactNode;
  innerRef?: React.Ref<HTMLDivElement>;
}): ReactElement => (
  <div
    ref={innerRef}
    data-arm={arm}
    className={className}
    onMouseOver={arm === 'final' ? toggleLabelHover(true) : undefined}
    onMouseOut={arm === 'final' ? toggleLabelHover(false) : undefined}
  >
    <style>{FINAL_CSS}</style>
    {children}
  </div>
);

const Page = ({
  question,
  title,
  children,
  intro,
}: {
  question: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default p-6 tablet:p-10">
    <div className="flex max-w-[75rem] flex-col gap-10">
      <header className="flex max-w-[50rem] flex-col gap-3">
        <p className="font-bold uppercase text-text-tertiary typo-caption1">
          {question}
        </p>
        <h1 className="font-bold text-text-primary typo-title1">{title}</h1>
        {intro}
      </header>
      {children}
    </div>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
    {children}
  </section>
);

const TableShell = ({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full text-left typo-footnote">
      <thead>
        <tr className="text-text-tertiary">
          {head.map((cell) => (
            <th key={cell} className="p-3 font-normal">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: string[][];
}): ReactElement => (
  <TableShell head={head}>
    {rows.map((row) => (
      <tr key={row[0]} className="border-t border-border-subtlest-tertiary">
        {row.map((cell, index) => (
          <td
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={classNames(
              'p-3',
              index === 0
                ? 'font-bold text-text-primary'
                : 'text-text-secondary',
            )}
          >
            {cell}
          </td>
        ))}
      </tr>
    ))}
  </TableShell>
);

interface Measure {
  gap: number;
  offscreen: number;
}

const barOf = (card: HTMLElement): HTMLElement | null =>
  card
    .querySelector('[id$="-upvote-btn"]')
    ?.closest<HTMLElement>('div.flex-1') ?? null;

const measureBar = (card: HTMLElement, edge: number): Measure | null => {
  const bar = barOf(card);
  if (!bar) {
    return null;
  }
  const rects = Array.from(bar.children)
    .map((child) => child.getBoundingClientRect())
    .filter((rect) => rect.width > 0);
  const gaps = rects.slice(1).map((rect, i) => rect.left - rects[i].right);
  const right = Math.max(...rects.map((rect) => rect.right));
  return { gap: Math.min(...gaps), offscreen: Math.max(0, right - edge) };
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
  return { text: `${gap.toFixed(1)}px gap`, bad: gap < HEALTHY_GAP };
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

const worstOf = (measures: (Measure | null | undefined)[]) =>
  measures.reduce<Measure | null | undefined>(
    (acc, m) =>
      !m
        ? acc
        : !acc ||
          m.offscreen > acc.offscreen ||
          (m.offscreen === acc.offscreen && m.gap < acc.gap)
        ? m
        : acc,
    undefined,
  );

const ARM_LABEL: Record<Arm, string> = {
  production: 'Production',
  final: 'Final',
};

const DECISIONS: {
  decision: string;
  production: string;
  list: string;
  grid: string;
}[] = [
  {
    decision: 'Number rule',
    production: 'Nearest, one decimal: 150,900 reads 150.9K, 1,790 reads 1.8K',
    list: 'One decimal only under 10 in its unit, always rounded down: 150K, 1.7K',
    grid: 'Same as the list',
  },
  {
    decision: 'Button size',
    production: 'List 24px, grid 32px',
    list: '32px',
    grid: '32px',
  },
  {
    decision: 'Icon size',
    production: 'List 16px, grid 20px',
    list: '19px',
    grid: '19px',
  },
  {
    decision: 'Icon to number',
    production: 'List 6px, grid 8px, medium weight',
    list: '4px, regular weight',
    grid: '4px, regular weight',
  },
  {
    decision: 'After the number',
    production: '2px',
    list: 'Nothing',
    grid: 'Nothing',
  },
  {
    decision: 'Bar edges',
    production:
      'List: the upvote button on the text edge. Grid: 6px below the image, 4px left, 10px after the views number, 2px bottom',
    list: 'The upvote icon on the text edge',
    grid: '4px below the image, 4px left, 8px after the views number, 4px bottom',
  },
  {
    decision: 'Hover under a number',
    production:
      'Only the comment counter shows it; the others light up on the icon alone',
    list: 'The whole 32px counter shows the hover',
    grid: 'Same as the list',
  },
  {
    decision: 'Bookmark',
    production: 'List in the bar, grid in the header',
    list: 'In the bar',
    grid: 'Stays in the header',
  },
  {
    decision: 'Read post on phones',
    production: 'Icon-only, with an oversized hover box off the icon',
    list: 'Icon-only 32 × 32, next to ⋯',
    grid: 'Not on phones',
  },
];

const RESULTS: { surface: string; widths: number[]; rows: string[][] }[] = [
  {
    surface: 'List cards',
    widths: LIST_WIDTHS,
    rows: [
      ['Production', '5.9px', '13.9px', '16.9px'],
      ['Final', '6.0px', '14.0px', '17.0px'],
    ],
  },
  {
    surface: 'Grid cards',
    widths: GRID_WIDTHS,
    rows: [
      ['Production', '7.6px off screen', '2.3px', '12.3px'],
      ['Final', '7.9px', '14.9px', '24.9px'],
    ],
  },
];

const DecisionsPage = (): ReactElement => (
  <Page
    question="What did we decide for the card action bar?"
    title="Card action bar: decisions"
    intro={
      <>
        <p className="text-text-secondary typo-body">
          Goal: a bigger, easier to tap action bar on list cards, the phone
          feed, that holds up on small phones, and one bar on list and grid
          cards. The list change runs as the list_card_large_actions experiment,
          measuring bookmarks, upvotes and comments per user, with post clicks
          as the guardrail because list cards get 8px taller.
        </p>
        <p className="text-text-secondary typo-body">
          Design metric: the smallest gap between two bar buttons with
          worst-case counts (99K upvotes, 9.9K comments, 999K views). Buttons
          never shrink, so a long number widens the bar until buttons touch or
          leave the card. {HEALTHY_GAP}px or more is healthy.
        </p>
      </>
    }
  >
    <Section title="Production and final">
      <Table
        head={['', 'Production', 'List final', 'Grid final']}
        rows={DECISIONS.map(({ decision, production, list, grid }) => [
          decision,
          production,
          list,
          grid,
        ])}
      />
    </Section>

    <Section title="Smallest gap, worst case">
      {RESULTS.map(({ surface, widths, rows }) => (
        <Table
          key={surface}
          head={[surface, ...widths.map((width) => `${width}px`)]}
          rows={rows}
        />
      ))}
      <p className="text-text-tertiary typo-callout">
        Measured on Oct 30, 2026. The list and grid pages measure live.
      </p>
    </Section>

    <Section title="How it ships">
      <p className="max-w-[50rem] text-text-tertiary typo-callout">
        Nothing here is built yet. These pages style the final bar over the
        production cards, so each change below can land as its own PR.
      </p>
      <Table
        head={['', 'What', 'Who sees it']}
        rows={[
          [
            'Fixes',
            'The number rule, the hover under a number, and the icon-only Read post on phones',
            'Everyone, every counter in the app',
          ],
          [
            'List experiment',
            'The list final behind list_card_large_actions: boolean, default false, 50/50 on user ID, logged-in users',
            'The treatment arm, once the flag is set up in GrowthBook',
          ],
          [
            'Grid cards',
            'The grid final: 19px icons, the counter spacing and the even spacing around the bar',
            'Everyone on grid cards',
          ],
        ]}
      />
    </Section>
  </Page>
);

const ListColumn = ({
  arm,
  children,
}: {
  arm: Arm;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-1 flex-col gap-3">
    <div>
      <p className="font-bold text-text-primary typo-callout">
        {ARM_LABEL[arm]}
      </p>
      <p className="text-text-tertiary typo-caption1">
        {arm === 'production'
          ? '24px buttons, 16px icons. The control arm keeps it.'
          : '32px buttons, 19px icons, the number 4px away. The treatment arm.'}
      </p>
    </div>
    <ArmScope arm={arm} className="flex w-full max-w-[40rem] flex-col">
      {children}
    </ArmScope>
  </div>
);

const ListPage = (): ReactElement => (
  <Page
    question="What do list cards look like?"
    title="List cards"
    intro={
      <p className="text-text-secondary typo-body">
        Production next to the final bar on every list card type. The final bar
        has 32px buttons with 19px icons, the number 4px from the icon at
        regular weight with nothing after it, and the upvote icon on the text
        edge. The bookmark stays in the bar. Hover anywhere on a counter, number
        included, to see its hover.
      </p>
    }
  >
    <div className="flex flex-col gap-10 laptop:flex-row">
      {ARMS.map((arm) => (
        <ListColumn key={arm} arm={arm}>
          {CARDS.map(({ label, post: cardPost }) => {
            const Card = PostTypeToListCard[cardPost.type] ?? ArticleList;
            return (
              <Card key={label} post={forArm(arm, cardPost)} {...handlers} />
            );
          })}
        </ListColumn>
      ))}
    </div>
  </Page>
);

const frameKey = (arm: Arm, width: number): string => `${arm}@${width}`;

const FrameCards = ({ arm }: { arm: Arm }): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [measures, setMeasures] = useState<Record<string, Measure | null>>({});

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) {
      return undefined;
    }
    const measure = () => {
      const next = Object.fromEntries(
        Array.from(root.querySelectorAll<HTMLElement>('[data-case]')).map(
          (card) => [
            card.dataset.case,
            measureBar(card, document.documentElement.clientWidth),
          ],
        ),
      );
      setMeasures(next);
      window.parent.postMessage(
        {
          source: 'card-action-bar',
          key: frameKey(arm, window.innerWidth),
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
  }, [arm]);

  return (
    <ArmScope
      arm={arm}
      innerRef={ref}
      className="flex flex-col bg-background-default"
    >
      <style>{'img[alt="Post Cover image"]{display:none}'}</style>
      {COUNT_ORDER.map((key) => {
        const count = COUNTS[key];
        const cardPost = {
          ...article,
          id: `small-${key}`,
          numUpvotes: count.upvotes,
          numComments: count.comments,
          analytics: { impressions: count.views },
        } as Post;
        return (
          <div key={key} data-case={key}>
            <div className="flex items-center justify-between px-4 pt-3">
              <span className="font-bold text-text-secondary typo-caption1">
                {count.label}
              </span>
              <Badge measure={measures[key]} />
            </div>
            <ArticleList post={forArm(arm, cardPost)} {...handlers} />
          </div>
        );
      })}
    </ArmScope>
  );
};

const FRAME_ID = 'experiments-card-action-bar--frame';

interface FrameReports {
  results: Record<string, Record<string, Measure | null>>;
  heights: Record<string, number>;
}

const useFrameReports = (): FrameReports => {
  const [reports, setReports] = useState<FrameReports>({
    results: {},
    heights: {},
  });

  useEffect(() => {
    const onMessage = ({ data }: MessageEvent) => {
      if (data?.source !== 'card-action-bar') {
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

  useEffect(() => {
    const timer = window.setInterval(() => setCount((c) => c + 1), 4000);
    return () => window.clearInterval(timer);
  }, []);

  return (index: number) => index < Math.max(count, reported + 3);
};

const Phone = ({
  arm,
  width,
  height,
  isLoaded,
}: {
  arm: Arm;
  width: number;
  height?: number;
  isLoaded: boolean;
}): ReactElement => {
  // A frame whose module import failed shows Storybook's error: load it again.
  const [attempt, setAttempt] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const isReported = height !== undefined;
  const frameHeight = height ?? 900;

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
        {width}px
      </span>
      <div
        className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
        style={{ width, height: frameHeight }}
      >
        {isLoaded && (
          <iframe
            key={attempt}
            ref={frameRef}
            title={`${ARM_LABEL[arm]} at ${width}px`}
            src={`iframe.html?id=${FRAME_ID}&viewMode=story&args=arm:${arm}&globals=theme:dark`}
            width={width}
            height={frameHeight}
            className="block border-0"
          />
        )}
      </div>
    </div>
  );
};

const SmallPhonesPage = (): ReactElement => {
  const { results, heights } = useFrameReports();
  const keys = ARMS.flatMap((arm) =>
    LIST_WIDTHS.map((width) => frameKey(arm, width)),
  );
  const isLoaded = useLoadQueue(keys, heights);

  return (
    <Page
      question="Does the final list bar hold up on small phones?"
      title="List cards on small phones"
      intro={
        <>
          <p className="text-text-secondary typo-body">
            Goal: nobody in the treatment sees buttons that touch or run off the
            screen, so every phone width gets the 32px bar. Metric: the smallest
            gap between two bar buttons, measured live in each phone below,
            which is a real viewport. Under {HEALTHY_GAP}px is flagged.
          </p>
          <p className="text-text-tertiary typo-callout">
            Counts are upvotes · comments · views, as the final bar prints them:{' '}
            {finalCountsLine}. Cover images are hidden to keep the phones short.
          </p>
        </>
      }
    >
      <TableShell
        head={['', ...LIST_WIDTHS.map((width) => `Worst case at ${width}px`)]}
      >
        {ARMS.map((arm) => (
          <tr key={arm} className="border-t border-border-subtlest-tertiary">
            <td className="p-3 font-bold text-text-primary">
              {ARM_LABEL[arm]}
            </td>
            {LIST_WIDTHS.map((width) => (
              <td key={width} className="p-3">
                <Badge
                  measure={worstOf(
                    Object.values(results[frameKey(arm, width)] ?? {}),
                  )}
                />
              </td>
            ))}
          </tr>
        ))}
      </TableShell>
      {ARMS.map((arm, armIndex) => (
        <Section key={arm} title={ARM_LABEL[arm]}>
          <div className="flex flex-wrap items-start gap-6">
            {LIST_WIDTHS.map((width, widthIndex) => (
              <Phone
                key={width}
                arm={arm}
                width={width}
                height={heights[frameKey(arm, width)]}
                isLoaded={isLoaded(armIndex * LIST_WIDTHS.length + widthIndex)}
              />
            ))}
          </div>
        </Section>
      ))}
    </Page>
  );
};

const GridArm = ({
  arm,
  onMeasure,
}: {
  arm: Arm;
  onMeasure: (arm: Arm, measures: Record<string, Measure | null>) => void;
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
          (card) => [
            card.dataset.gridCard,
            measureBar(card, card.getBoundingClientRect().right),
          ],
        ),
      );
      setMeasures(next);
      onMeasure(arm, next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arm]);

  return (
    <ArmScope arm={arm} innerRef={ref} className="flex flex-col gap-6">
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
                    <ArticleGrid post={forArm(arm, cardPost)} {...handlers} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </ArmScope>
  );
};

const GRID_ARM_NOTE: Record<Arm, string> = {
  production:
    '32px buttons, 20px icons, the number 8px from the icon at medium weight with 2px after it. 6px below the cover image, 4px from the left, 10px after the views number, 2px from the bottom.',
  final:
    '32px buttons, 19px icons, the number 4px from the icon at regular weight with nothing after it. 4px below the cover image, from the left and from the bottom, 8px after the views number. The card keeps its height.',
};

const GridPage = (): ReactElement => {
  const [results, setResults] = useState<
    Partial<Record<Arm, Record<string, Measure | null>>>
  >({});
  const onMeasure = (
    arm: Arm,
    measures: Record<string, Measure | null>,
  ): void => setResults((prev) => ({ ...prev, [arm]: measures }));

  return (
    <Page
      question="What do grid cards look like with the list decisions?"
      title="Grid cards"
      intro={
        <p className="text-text-secondary typo-body">
          Goal: one action bar on grid and list cards, with the bookmark staying
          in the grid header. Metric: the smallest gap between bar buttons with
          the worst-case counts, measured live down to the narrowest grid card
          (272px). Under {HEALTHY_GAP}px is flagged. Hover a card to see its
          header buttons.
        </p>
      }
    >
      <TableShell
        head={['', ...GRID_WIDTHS.map((width) => `Worst case at ${width}px`)]}
      >
        {ARMS.map((arm) => (
          <tr key={arm} className="border-t border-border-subtlest-tertiary">
            <td className="p-3 font-bold text-text-primary">
              {ARM_LABEL[arm]}
            </td>
            {GRID_WIDTHS.map((width) => (
              <td key={width} className="p-3">
                <Badge
                  measure={worstOf(
                    Object.entries(results[arm] ?? {})
                      .filter(([key]) => key.endsWith(`@${width}`))
                      .map(([, measure]) => measure),
                  )}
                />
              </td>
            ))}
          </tr>
        ))}
      </TableShell>
      {ARMS.map((arm) => (
        <section
          key={arm}
          className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-8"
        >
          <div className="flex max-w-[50rem] flex-col gap-1">
            <h2 className="font-bold text-text-primary typo-title3">
              {ARM_LABEL[arm]}
            </h2>
            <p className="text-text-secondary typo-callout">
              {GRID_ARM_NOTE[arm]}
            </p>
          </div>
          <GridArm arm={arm} onMeasure={onMeasure} />
        </section>
      ))}
    </Page>
  );
};

const meta: Meta = {
  title: 'Experiments/Card action bar',
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

export const Decisions: StoryObj = {
  name: '0. Decisions',
  parameters: { options: { showPanel: false } },
  render: () => <DecisionsPage />,
};

export const List: StoryObj = {
  name: '1. List cards',
  parameters: { options: { showPanel: false } },
  render: () => <ListPage />,
};

export const SmallPhones: StoryObj = {
  name: '2. List cards on small phones',
  parameters: { options: { showPanel: false } },
  render: () => <SmallPhonesPage />,
};

export const Grid: StoryObj = {
  name: '3. Grid cards',
  parameters: { options: { showPanel: false } },
  render: () => <GridPage />,
};

export const Frame: StoryObj<{ arm: Arm }> = {
  name: 'Phone frame',
  tags: ['!dev'],
  args: { arm: 'final' },
  argTypes: { arm: { control: 'inline-radio', options: ARMS } },
  render: ({ arm }) => <FrameCards arm={arm} />,
};
