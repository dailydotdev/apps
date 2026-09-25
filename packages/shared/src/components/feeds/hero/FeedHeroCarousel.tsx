import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useSwipeable } from 'react-swipeable';
import { useInView } from 'react-intersection-observer';
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
  /** Passed in, not measured, so the card and the layout share one number. */
  layout?: FeedHeroLayout;
  /** Called once per post brought on screen, so clicks have a denominator. */
  onPostImpression?: (post: Post) => void;
  className?: string;
};

const wrapIndex = (index: number, total: number): number =>
  (index + total) % total;

export const FeedHeroCarousel = ({
  posts,
  autoplayMs = 6000,
  layout = 'stacked',
  onPostImpression,
  className,
  ...cardProps
}: FeedHeroCarouselProps): ReactElement | null => {
  const [slide, setSlide] = useState<{ index: number; from: number | null }>({
    index: 0,
    from: null,
  });
  const [isManualChange, setIsManualChange] = useState(false);
  // Slides the reader has actually been shown. Only the active one is visible,
  // so the rest are deliberately never counted.
  const logged = useRef(new Set<string>());
  // The same threshold the grid's cards use, so a hero impression and a card
  // impression mean the same thing when the two are compared.
  const { ref: inViewRef, inView } = useInView({ threshold: 0.5 });
  const active = posts.length ? wrapIndex(slide.index, posts.length) : 0;
  const shown = layout === 'stacked' ? posts[0] : posts[active];

  useEffect(() => {
    if (!inView || !shown || logged.current.has(shown.id)) {
      return;
    }

    logged.current.add(shown.id);
    onPostImpression?.(shown);
  }, [inView, shown, onPostImpression]);

  const total = posts.length;

  const moveTo = (position: number) => {
    if (!total || wrapIndex(position, total) === active) {
      return;
    }
    setSlide({ index: position, from: active });
  };

  const goTo = (position: number) => {
    setIsManualChange(true);
    moveTo(position);
  };

  // A touch laptop gets the grid layouts but no swipe from the dots and arrows
  // alone, so the same gesture the rest of the app's carousels accept.
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goTo(active + 1),
    onSwipedRight: () => goTo(active - 1),
    preventScrollOnSwipe: false,
    trackMouse: false,
  });

  // The region is only live for the slide a manual change brings in. Reset on
  // a timer rather than on the next automatic advance, which never arrives
  // while the reader is hovering or focused — and would leave every later
  // rotation announcing itself.
  useEffect(() => {
    if (!isManualChange) {
      return undefined;
    }

    const timeout = setTimeout(() => setIsManualChange(false), 1000);

    return () => clearTimeout(timeout);
  }, [isManualChange, active]);

  if (!posts.length) {
    return null;
  }

  // No paging at one column: a slide has to stop short of the edge for the
  // next to peek, which left every card too narrow to read. The stories it
  // would have paged through are the headline list's first rows.
  if (layout === 'stacked') {
    const [lead] = posts;
    const LeadCard = PostTypeToListCard[lead.type] ?? ArticleList;

    return (
      <section
        ref={inViewRef}
        aria-label="Featured post"
        className={classNames('flex min-w-0 flex-col', className)}
      >
        <LeadCard post={lead} {...cardProps} />
      </section>
    );
  }

  const post = posts[active];
  const outgoing = slide.from === null ? null : posts[slide.from];
  const isWide = layout === 'wide';
  const cardFor = (item: Post) => {
    if (isWide) {
      return PostTypeToWideCard[item.type] ?? ArticleFeaturedWideGridCard;
    }

    return PostTypeToGridCard[item.type] ?? ArticleGrid;
  };
  const Card = cardFor(post);
  const wideProps = isWide ? { hero: true } : {};
  const previous = posts[wrapIndex(active - 1, total)];
  const next = posts[wrapIndex(active + 1, total)];

  // The outgoing slide stays mounted until its fade ends, so the two cross
  // over instead of the card popping.
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
      ref={inViewRef}
      aria-label="Featured posts"
      aria-roledescription="carousel"
      className={classNames(
        // The bottom inset the other two columns already carry, so all three
        // finish on one line.
        'group/hero flex min-h-0 min-w-0 flex-col gap-3 pb-3',
        className,
      )}
    >
      <div
        {...swipeHandlers}
        // `overflow-hidden` makes this box the last word on a slide's height:
        // a card wanting more would paint over the controls underneath.
        className="grid min-h-0 flex-1 overflow-hidden"
        // Announcing every automatic rotation would talk over the reader, so
        // only a change the user asked for is live.
        aria-live={isManualChange ? 'polite' : 'off'}
      >
        {outgoingSlide}
        <div
          key={post.id}
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
                    className={classNames(
                      'feed-hero-carousel-progress block h-full w-full rounded-max bg-text-primary group-focus-within/hero:[animation-play-state:paused] group-hover/hero:[animation-play-state:paused]',
                      // Off screen the rotation would burn through all four
                      // posts unseen, and take the ad column's neighbour with
                      // it.
                      !inView && '[animation-play-state:paused]',
                    )}
                    onAnimationEnd={() => moveTo(active + 1)}
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
