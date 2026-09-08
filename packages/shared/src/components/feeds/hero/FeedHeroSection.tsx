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

/**
 * Written out rather than built, because Tailwind only generates the classes it
 * can see. Six is the grid's own ceiling — `FeedContext`'s widest setting.
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

interface FeedHeroSectionProps {
  posts: Post[];
  highlights: PostHighlight[];
  ad?: Ad;
  /**
   * Where the section is putting the ad. Decided by the caller from the same
   * shape passed in here, so the column and what goes in it cannot disagree.
   */
  adPlacement?: FeedHeroAdPlacement;
  /** The section's row, measured against the feed grid's column count. */
  shape?: FeedHeroShape;
  cardProps?: Omit<FeaturedWideCardProps, 'post'>;
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
  onAdLinkClick,
  onAdViewable,
  onHighlightClick,
  onReadAllClick,
  className,
}: FeedHeroSectionProps): ReactElement {
  const adProps = { onLinkClick: onAdLinkClick, onViewable: onAdViewable };
  const { columns, featuredSpan, railSpan, layout } = shape;
  // One column stacks: no grid to hold columns apart, and no row height, since
  // the list card and the headline list each take what they need.
  const isStacked = layout === 'stacked';

  return (
    <div className={classNames('w-full', className)}>
      <section
        className={classNames(
          'w-full',
          isStacked
            ? 'flex flex-col gap-6'
            : classNames(
                // The grid's own gap, so the hero's columns land on the
                // columns underneath rather than near them.
                'grid gap-8',
                gridColsClass[columns],
                // The featured card's height plus the 3.5rem the paging
                // controls and their gaps need under it. A single column is
                // the narrow case, where the title wraps furthest and the card
                // runs to its `max-h-cardLarge` ceiling; across two or more it
                // settles 3rem shorter, and the row gives that back to the
                // first feed row rather than holding a gap open.
                layout === 'wide'
                  ? 'grid-rows-[27.5rem]'
                  : 'grid-rows-[30.5rem]',
              ),
        )}
      >
        <FeedHeroCarousel
          posts={posts}
          layout={layout}
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
