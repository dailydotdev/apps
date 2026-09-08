import type { CSSProperties, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { PostTypeToWideCard } from '../../cards/common/wideCards';
import { ArticleFeaturedWideGridCard } from '../../cards/article/ArticleFeaturedWideGridCard';
import { PostTypeToGridCard } from '../../cards/common/gridCards';
import { PostTypeToListCard } from '../../cards/common/listCards';
import { ArticleList } from '../../cards/article/ArticleList';
import { ArticleGrid } from '../../cards/article/ArticleGrid';
import type { FeedHeroLayout } from './feedHeroShape';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Tooltip } from '../../tooltip/Tooltip';
import { ArrowIcon } from '../../icons';

export type FeedHeroCarouselProps = Omit<FeaturedWideCardProps, 'post'> & {
  posts: Post[];
  autoplayMs?: number;
  /**
   * The section's shape. Passed in rather than measured here so the card and
   * the layout around it come from one number: read apart, a viewport
   * breakpoint and a container query disagreed, and a list card stretched down
   * a 30rem column was the result.
   */
  layout?: FeedHeroLayout;
  className?: string;
};

const wrapIndex = (index: number, total: number): number =>
  (index + total) % total;

export const FeedHeroCarousel = ({
  posts,
  autoplayMs = 6000,
  layout = 'stacked',
  className,
  ...cardProps
}: FeedHeroCarouselProps): ReactElement | null => {
  const [slide, setSlide] = useState<{ index: number; from: number | null }>({
    index: 0,
    from: null,
  });
  const [isManualChange, setIsManualChange] = useState(false);
  if (!posts.length) {
    return null;
  }

  // One column: the lead story as a list card, with the headline list under it,
  // so the section is the same kind of thing as the rows beneath it. There is
  // no paging here — a slide has to stop short of the edge for the next one to
  // peek, and at these widths that left every card too narrow to read. The
  // stories it would have paged through are the headline list's first rows.
  if (layout === 'stacked') {
    const [lead] = posts;
    const LeadCard = PostTypeToListCard[lead.type] ?? ArticleList;

    return (
      <section
        aria-label="Featured post"
        className={classNames('flex min-w-0 flex-col', className)}
      >
        <LeadCard post={lead} {...cardProps} />
      </section>
    );
  }

  const total = posts.length;
  const active = wrapIndex(slide.index, total);

  const moveTo = (position: number) => {
    if (wrapIndex(position, total) === active) {
      return;
    }
    setSlide({ index: position, from: active });
  };

  const goTo = (position: number) => {
    setIsManualChange(true);
    moveTo(position);
  };

  const post = posts[active];
  const outgoing = slide.from === null ? null : posts[slide.from];
  // Half a section is about the width of a feed column, so the featured post
  // takes the card the feed itself would give it. The wide card's own layout
  // has nothing left to trade at that size and its copy clips mid-sentence.
  const isWide = layout === 'wide';
  const cardFor = (item: Post) => {
    if (isWide) {
      return PostTypeToWideCard[item.type] ?? ArticleFeaturedWideGridCard;
    }

    return PostTypeToGridCard[item.type] ?? ArticleGrid;
  };
  const Card = cardFor(post);
  // `hero` is the wide card's own prop; the standard card has no use for it.
  const wideProps = isWide ? { hero: true } : {};
  const previous = posts[wrapIndex(active - 1, total)];
  const next = posts[wrapIndex(active + 1, total)];

  // The slide being replaced stays mounted on top of the new one until its
  // fade finishes, so the two cross over instead of the card popping.
  let outgoingSlide: ReactElement | null = null;
  if (outgoing) {
    const OutgoingCard = cardFor(outgoing);
    outgoingSlide = (
      <div
        key={outgoing.id}
        aria-hidden
        data-testid="carouselOutgoing"
        className="feed-hero-slide-out pointer-events-none col-start-1 row-start-1 flex flex-col @container/wide"
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget) {
            return;
          }
          setSlide((current) => ({ ...current, from: null }));
        }}
      >
        <OutgoingCard post={outgoing} {...wideProps} {...cardProps} />
      </div>
    );
  }

  return (
    <section
      aria-label="Featured posts"
      aria-roledescription="carousel"
      className={classNames(
        // The bottom inset is the one the other two columns already carry — the
        // rail on its "Read all" footer, the ad through its card padding — so
        // this column's controls finish on their line rather than 12px below.
        'group/hero flex min-h-0 min-w-0 flex-col gap-3 pb-3',
        className,
      )}
    >
      <div
        // `overflow-hidden` makes this box the last word on a slide's height:
        // every post type renders its own card, and one that wants more than
        // the row would paint over the controls underneath.
        className="grid min-h-0 flex-1 overflow-hidden"
        // Announcing every automatic rotation would talk over the reader, so
        // only a change the user asked for is live.
        aria-live={isManualChange ? 'polite' : 'off'}
      >
        {outgoingSlide}
        <div
          key={post.id}
          // The card sizes its own split against this box, not the viewport:
          // the hero is only ever as wide as the reader's feed grid.
          className="feed-hero-slide-in col-start-1 row-start-1 flex flex-col @container/wide"
        >
          <Card post={post} {...wideProps} {...cardProps} />
        </div>
      </div>
      {total > 1 && (
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-1.5">
            {posts.map((item, position) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show featured post ${position + 1}`}
                aria-current={position === active}
                onClick={() => goTo(position)}
                className={classNames(
                  'h-1.5 overflow-hidden rounded-max bg-border-subtlest-primary transition-all',
                  position === active
                    ? 'w-6'
                    : 'w-1.5 hover:bg-text-quaternary',
                )}
              >
                {position === active && (
                  <span
                    key={active}
                    data-testid="carouselProgress"
                    style={
                      {
                        '--feed-hero-carousel-duration': `${autoplayMs}ms`,
                      } as CSSProperties
                    }
                    className="feed-hero-carousel-progress block h-full w-full rounded-max bg-text-primary group-focus-within/hero:[animation-play-state:paused] group-hover/hero:[animation-play-state:paused]"
                    onAnimationEnd={() => {
                      setIsManualChange(false);
                      moveTo(active + 1);
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip content={previous.title}>
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<ArrowIcon className="-rotate-90" />}
                onClick={() => goTo(active - 1)}
                aria-label={`Previous: ${previous.title}`}
              />
            </Tooltip>
            <Tooltip content={next.title}>
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<ArrowIcon className="rotate-90" />}
                onClick={() => goTo(active + 1)}
                aria-label={`Next: ${next.title}`}
              />
            </Tooltip>
          </div>
        </div>
      )}
    </section>
  );
};
