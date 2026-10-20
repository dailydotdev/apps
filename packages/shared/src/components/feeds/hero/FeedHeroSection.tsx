import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import type { Ad, Post } from '../../../graphql/posts';
import type { PostHighlight } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { HighlightCardContent } from '../../cards/highlight/common';
import { PostTypeToGridCard } from '../../cards/common/gridCards';
import { ArticleGrid } from '../../cards/article/ArticleGrid';
import { FeedHeroAdCard } from './FeedHeroAdCard';
import { FeedHeroCarousel } from './FeedHeroCarousel';
import type { FeedHeroAdPlacement, FeedHeroShape } from './feedHeroShape';
import { feedHeroShape } from './feedHeroShape';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { PlaceholderList } from '../../cards/placeholder/PlaceholderList';
import classed from '../../../lib/classed';

/**
 * Written out, not built: Tailwind only generates the classes it can see. Must
 * cover every count up to `MAX_HERO_COLUMNS`, which is what `feedHeroShape`
 * stacks above — `feedHeroShape.spec.ts` pins the two together.
 */
const gridColsClass: Partial<Record<number, string>> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const colSpanClass: Partial<Record<number, string>> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
};

const sectionClassName = ({ columns, layout }: FeedHeroShape): string =>
  classNames(
    'w-full',
    layout === 'stacked'
      ? 'flex flex-col gap-6'
      : classNames(
          // The feed grid's own gap, so the columns line up with it.
          'grid gap-8',
          gridColsClass[columns],
          // The card's height plus the 3.5rem the paging controls need
          // under it. One column wraps the title furthest and runs to
          // `max-h-cardLarge`; wider, the card settles 3rem shorter.
          layout === 'wide' ? 'grid-rows-[27.5rem]' : 'grid-rows-[30.5rem]',
        ),
  );

const PlaceholderText = classed(ElementPlaceholder, 'h-3 rounded-12');

/**
 * Holds the section's exact footprint while its query is in flight, so the
 * feed below does not jump when the posts arrive.
 */
export function FeedHeroSkeleton({
  shape = feedHeroShape(1),
  className,
}: {
  shape?: FeedHeroShape;
  className?: string;
}): ReactElement {
  const { columns, featuredSpan, railSpan, layout } = shape;
  const isStacked = layout === 'stacked';
  const spareColumns = isStacked ? 0 : columns - featuredSpan - railSpan;
  const railRows = [0, 1, 2, 3].map((row) => (
    <div key={row} className="flex flex-col gap-2 py-3">
      <PlaceholderText className="w-full" />
      <PlaceholderText className="w-2/3" />
    </div>
  ));

  return (
    <div aria-busy className={classNames('w-full', className)}>
      <section className={sectionClassName(shape)}>
        {isStacked ? (
          <PlaceholderList />
        ) : (
          <div
            className={classNames(
              'flex min-h-0 flex-col gap-3 pb-3',
              colSpanClass[featuredSpan],
            )}
          >
            <ElementPlaceholder className="min-h-0 flex-1 rounded-16" />
            <div className="h-6" />
          </div>
        )}
        <div
          className={classNames(
            'flex min-h-0 flex-col px-4',
            !isStacked && colSpanClass[railSpan],
          )}
        >
          <PlaceholderText className="mb-2 mt-2 h-6 w-1/2" />
          {railRows}
        </div>
        {Array.from({ length: spareColumns }, (_, column) => (
          <ElementPlaceholder
            key={column}
            className="mb-12 min-h-0 rounded-16"
          />
        ))}
      </section>
    </div>
  );
}

/**
 * A spare column's story, as the feed's own card. Bottom-padded by the
 * carousel's paging controls so it ends level with the featured card.
 */
const FeedHeroSideCard = ({
  post,
  onImpression,
  ...cardProps
}: Omit<FeaturedWideCardProps, 'post'> & {
  post: Post;
  onImpression?: (post: Post) => void;
}): ReactElement => {
  const { ref, inView } = useInView({ threshold: 0.5 });
  const isLogged = useRef(false);
  const Card = PostTypeToGridCard[post.type] ?? ArticleGrid;

  useEffect(() => {
    if (!inView || isLogged.current) {
      return;
    }

    isLogged.current = true;
    onImpression?.(post);
  }, [inView, onImpression, post]);

  return (
    <div ref={ref} className="flex min-h-0 min-w-0 flex-col pb-12">
      <Card post={post} {...cardProps} />
    </div>
  );
};

interface FeedHeroSectionProps {
  posts: Post[];
  highlights: PostHighlight[];
  ad?: Ad;
  adPlacement?: FeedHeroAdPlacement;
  /** The section's row, measured against the feed grid's column count. */
  shape?: FeedHeroShape;
  cardProps?: Omit<FeaturedWideCardProps, 'post'>;
  /** Called once per post the carousel actually brings on screen. */
  onPostImpression?: (post: Post) => void;
  onAdLinkClick?: (ad: Ad) => unknown;
  onAdViewable?: (ad: Ad, data: ViewabilityData) => void;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onReadAllClick?: () => void;
  className?: string;
}

export function FeedHeroSection({
  posts,
  highlights,
  ad,
  adPlacement = 'none',
  shape = feedHeroShape(1),
  cardProps,
  onPostImpression,
  onAdLinkClick,
  onAdViewable,
  onHighlightClick,
  onReadAllClick,
  className,
}: FeedHeroSectionProps): ReactElement {
  const adProps = { onLinkClick: onAdLinkClick, onViewable: onAdViewable };
  const { columns, featuredSpan, railSpan, layout } = shape;
  const isStacked = layout === 'stacked';
  const hasAdColumn = !isStacked && adPlacement === 'column';
  // Columns the featured card, the rail and the ad leave over take the stories
  // after the carousel's, so the row always runs the grid's full width.
  const spareColumns = isStacked
    ? 0
    : columns - featuredSpan - railSpan - (hasAdColumn ? 1 : 0);
  const sideCount = Math.max(0, Math.min(spareColumns, posts.length - 1));
  const carouselPosts = posts.slice(0, posts.length - sideCount);
  const sidePosts = posts.slice(posts.length - sideCount);

  return (
    <div className={classNames('w-full', className)}>
      <section className={sectionClassName(shape)}>
        <FeedHeroCarousel
          posts={carouselPosts}
          layout={layout}
          onPostImpression={onPostImpression}
          className={isStacked ? undefined : colSpanClass[featuredSpan]}
          {...cardProps}
        />
        <aside
          className={classNames(
            'group flex min-h-0 min-w-0 flex-col overflow-hidden',
            !isStacked && colSpanClass[railSpan],
          )}
        >
          <HighlightCardContent
            highlights={highlights}
            onHighlightClick={onHighlightClick}
            onReadAllClick={onReadAllClick}
            variant="grid"
            compact
          />
        </aside>
        {hasAdColumn && (
          <aside className="col-span-1 flex min-h-0 min-w-0 flex-col overflow-hidden">
            {ad ? (
              <FeedHeroAdCard ad={ad} {...adProps} />
            ) : (
              <ElementPlaceholder className="mb-12 min-h-0 flex-1 rounded-16" />
            )}
          </aside>
        )}
        {sidePosts.map((post) => (
          <FeedHeroSideCard
            key={post.id}
            post={post}
            onImpression={onPostImpression}
            {...cardProps}
          />
        ))}
      </section>
    </div>
  );
}
