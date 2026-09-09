import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad, Post } from '../../../graphql/posts';
import type { PostHighlight } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { HighlightCardContent } from '../../cards/highlight/common';
import { FeedHeroAdCard } from './FeedHeroAdCard';
import { FeedHeroCarousel } from './FeedHeroCarousel';
import type { FeedHeroAdPlacement, FeedHeroShape } from './feedHeroShape';
import { feedHeroShape } from './feedHeroShape';

/** Written out, not built: Tailwind only generates the classes it can see. */
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
  // A column count with no class written out would render an unclassed grid —
  // one implicit column with `col-span-3` children overflowing it. Stacking is
  // a layout the reader can still use.
  const isStacked = layout === 'stacked' || !gridColsClass[columns];

  return (
    <div className={classNames('w-full', className)}>
      <section
        className={classNames(
          'w-full',
          isStacked
            ? 'flex flex-col gap-6'
            : classNames(
                // The feed grid's own gap, so the columns line up with it.
                'grid gap-8',
                gridColsClass[columns],
                // The card's height plus the 3.5rem the paging controls need
                // under it. One column wraps the title furthest and runs to
                // `max-h-cardLarge`; wider, the card settles 3rem shorter.
                layout === 'wide'
                  ? 'grid-rows-[27.5rem]'
                  : 'grid-rows-[30.5rem]',
              ),
        )}
      >
        <FeedHeroCarousel
          posts={posts}
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
        {!!ad && adPlacement === 'column' && (
          <aside className="col-span-1 flex min-h-0 min-w-0 flex-col overflow-hidden">
            <FeedHeroAdCard ad={ad} {...adProps} />
          </aside>
        )}
      </section>
    </div>
  );
}
