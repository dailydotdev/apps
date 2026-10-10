import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import FeedItemContainer from '@dailydotdev/shared/src/components/cards/common/FeedItemContainer';
import {
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from '@dailydotdev/shared/src/components/cards/common/Card';
import { Container } from '@dailydotdev/shared/src/components/cards/common/common';
import { PostCardHeader } from '@dailydotdev/shared/src/components/cards/common/PostCardHeader';
import PostTags from '@dailydotdev/shared/src/components/cards/common/PostTags';
import PostMetadata from '@dailydotdev/shared/src/components/cards/common/PostMetadata';
import { PostCardFooter } from '@dailydotdev/shared/src/components/cards/common/PostCardFooter';
import type { DemoActions } from '../../demo';
import { useDemoActions as useDemoActionsFor } from '../../demo';

/**
 * One post on every card, so the only thing that differs between two cards is
 * the action bar. The counts are the widest each one gets under the proposed
 * number rule — four characters: "1.7K", "312", "234K".
 */
export const demoPost = {
  id: 'bigger-actions-1',
  title: 'Cloud Run now scales to zero, and cold starts got 40% faster',
  permalink: 'https://api.daily.dev/r/bigger-actions-1',
  commentsPermalink: 'https://app.daily.dev/posts/bigger-actions-1',
  createdAt: '2026-10-06T10:30:00.000Z',
  readTime: 8,
  type: PostType.Article,
  image:
    'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/article-placeholder',
  numUpvotes: 1740,
  numComments: 312,
  analytics: { impressions: 234500 },
  tags: ['gcp', 'serverless', 'devops'],
  bookmarked: false,
  read: false,
  commented: false,
  userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
  author: {
    id: 'u1',
    name: 'Dev Dana',
    username: 'devdana',
    image: 'https://media.daily.dev/image/upload/f_auto/v1/avatars/default',
    permalink: 'https://app.daily.dev/devdana',
  },
  source: {
    id: 'tds',
    handle: 'tds',
    name: 'Towards Data Science',
    permalink: 'https://app.daily.dev/sources/tds',
    image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
    type: 'machine' as const,
    active: true,
  },
} as unknown as Post;

export { compactCount, format } from '../../demo';
export type { DemoActions } from '../../demo';

/** Round 1 defaults to its single demo post. */
export const useDemoActions = (post: Post = demoPost): DemoActions =>
  useDemoActionsFor(post);

/* ------------------------------------------------------------------------ */
/* The card: production parts, in ArticleGrid's order, with the bar swapped. */
/* ------------------------------------------------------------------------ */

const CardWidthContext = createContext(0);
/** The card's rendered width, for bars that adapt to the space they get. */
export const useCardWidth = (): number => useContext(CardWidthContext);

interface VariantCardProps {
  bar: ReactNode;
  width?: number | string;
  /** Extra classes on the cover image (e.g. trimmed height). */
  imageClassName?: string;
  /** Rendered between the cover and the bar (a stats line, for example). */
  aboveBar?: ReactNode;
  post?: Post;
  showMeter?: boolean;
}

export const VariantCard = ({
  bar,
  width = 272,
  imageClassName,
  aboveBar,
  post = demoPost,
  showMeter = true,
}: VariantCardProps): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) =>
      setCardWidth(Math.round(entry.contentRect.width)),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ width }} className="flex flex-col gap-2">
      <div ref={ref} className="flex flex-col">
        <CardWidthContext.Provider value={cardWidth}>
          <FeedItemContainer
            domProps={{
              className: getPostClassNames(post, 'min-h-card'),
            }}
            flagProps={{}}
          >
            <div className="flex flex-1 flex-col">
              <CardTextContainer>
                <PostCardHeader
                  post={post}
                  className="flex"
                  source={post.source as Source}
                  postLink={post.permalink ?? ''}
                  onReadArticleClick={fn()}
                />
                <CardTitle>{post.title}</CardTitle>
              </CardTextContainer>
              <Container>
                <CardSpace />
                <div className="mx-4 flex items-center">
                  <PostTags post={post} />
                </div>
                <PostMetadata
                  createdAt={post.createdAt}
                  readTime={post.readTime}
                  className="mx-4"
                />
              </Container>
              <Container>
                <PostCardFooter
                  openNewTab={false}
                  post={post}
                  onShare={fn()}
                  className={{ image: classNames('px-1', imageClassName) }}
                />
                {aboveBar}
                <div data-bar="">{bar}</div>
              </Container>
            </div>
          </FeedItemContainer>
        </CardWidthContext.Provider>
      </div>
      {showMeter && <FitMeter cardRef={ref} />}
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* Fit meter: measured from the DOM, so a claim like "fits at 272px" is a    */
/* reading, not an estimate.                                                 */
/* ------------------------------------------------------------------------ */

interface Reading {
  buttons: number;
  height: number;
  icon: number;
  overflow: number;
  edge: number;
}

const measure = (card: HTMLElement): Reading | null => {
  const bar = card.querySelector<HTMLElement>('[data-bar]');
  if (!bar) {
    return null;
  }
  const box = card.getBoundingClientRect();
  // Rects are in zoomed pixels when a page scales the cards (the close-up);
  // divide them back to CSS pixels.
  const k = box.width / (card.offsetWidth || box.width) || 1;
  const targets = Array.from(
    bar.querySelectorAll<HTMLElement>('button, a[href]'),
  ).filter((el) => el.getBoundingClientRect().width > 0);
  if (!targets.length) {
    return null;
  }
  const rects = targets.map((el) => el.getBoundingClientRect());
  // Everything that paints in the bar (buttons and their counter labels).
  const painted = Array.from(bar.querySelectorAll<HTMLElement>('*'))
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0);
  const right = Math.max(...painted.map((r) => r.right));
  const left = Math.min(...painted.map((r) => r.left));
  // The most common icon size, so one small decorative icon does not
  // misreport a bar of 24px icons.
  const icons = targets
    .map(
      (el) => (el.querySelector('svg')?.getBoundingClientRect().width ?? 0) / k,
    )
    .filter(Boolean)
    .map(Math.round);
  const mode = icons.sort(
    (x, y) =>
      icons.filter((v) => v === y).length - icons.filter((v) => v === x).length,
  )[0];
  return {
    buttons: targets.length,
    height: Math.round(Math.min(...rects.map((r) => r.height)) / k),
    icon: mode ?? 0,
    overflow: Math.max(
      0,
      Math.round((right - box.right) / k),
      Math.round((box.left - left) / k),
    ),
    edge: Math.round(Math.min(box.right - right, left - box.left) / k),
  };
};

const FitMeter = ({
  cardRef,
}: {
  cardRef: React.RefObject<HTMLDivElement>;
}): ReactElement | null => {
  const [reading, setReading] = useState<Reading | null>(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) {
      return undefined;
    }
    const update = () => setReading(measure(node));
    update();
    // Counters animate in and fonts load late; re-read once things settle.
    const timer = window.setTimeout(update, 600);
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [cardRef]);

  if (!reading) {
    return null;
  }
  const fits = reading.overflow === 0;
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-text-tertiary typo-caption1">
      <span
        className={classNames(
          'rounded-6 border px-1.5 font-bold',
          fits
            ? 'border-accent-avocado-default text-accent-avocado-default'
            : 'border-accent-ketchup-default text-accent-ketchup-default',
        )}
      >
        {fits ? 'Fits' : `Overflows ${reading.overflow}px`}
      </span>
      <span className="tabular-nums">
        {reading.buttons} targets · {reading.height}px tall · {reading.icon}px
        icons
      </span>
    </p>
  );
};

/* ------------------------------------------------------------------------ */
/* Page furniture                                                            */
/* ------------------------------------------------------------------------ */

export const Page = ({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default p-8 text-text-primary">
    <h1 className="mb-2 font-bold typo-title2">{title}</h1>
    {intro && (
      <div className="mb-8 max-w-3xl text-text-tertiary typo-callout">
        {intro}
      </div>
    )}
    {children}
  </div>
);

export const Label = ({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'today' | 'new';
}): ReactElement => (
  <p
    className={classNames(
      'mb-2 font-bold typo-footnote',
      tone === 'today' && 'text-accent-ketchup-default',
      tone === 'new' && 'text-accent-avocado-default',
      tone === 'default' && 'text-text-secondary',
    )}
  >
    {children}
  </p>
);

/* ------------------------------------------------------------------------ */
/* Feed rows ask their cards which button size they ended up with.          */
/* ------------------------------------------------------------------------ */

type TierReport = (size: number) => void;
const TierReportContext = createContext<TierReport | null>(null);
export const TierReportProvider = TierReportContext.Provider;
export const useTierReport = (): TierReport | null =>
  useContext(TierReportContext);
