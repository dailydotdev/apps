import type { CSSProperties, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { PostTypeToWideCard } from '../../cards/common/wideCards';
import { PostTypeToListCard } from '../../cards/common/listCards';
import { ArticleFeaturedWideGridCard } from '../../cards/article/ArticleFeaturedWideGridCard';
import { ArticleList } from '../../cards/article/ArticleList';
import { useViewSize, ViewSize } from '../../../hooks';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Tooltip } from '../../tooltip/Tooltip';
import { ArrowIcon } from '../../icons';

export type FeedHeroCarouselProps = Omit<FeaturedWideCardProps, 'post'> & {
  posts: Post[];
  autoplayMs?: number;
  className?: string;
};

const wrapIndex = (index: number, total: number): number =>
  (index + total) % total;

export const FeedHeroCarousel = ({
  posts,
  autoplayMs = 6000,
  className,
  wideColSpan,
  ...cardProps
}: FeedHeroCarouselProps): ReactElement | null => {
  const [slide, setSlide] = useState<{ index: number; from: number | null }>({
    index: 0,
    from: null,
  });
  const [isManualChange, setIsManualChange] = useState(false);
  // Below laptop the feed itself renders list cards, so the featured post does
  // too — a two-column wide card leaves the headline about 180px on a phone.
  const isLaptop = useViewSize(ViewSize.Laptop);
  // The 40/60 split is only readable once the text column can still hold a
  // headline; on a 1024px laptop it leaves about 230px, so that falls back to
  // an even split.
  const isLaptopL = useViewSize(ViewSize.LaptopL);

  if (!posts.length) {
    return null;
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
  const cardFor = (item: Post) =>
    isLaptop
      ? PostTypeToWideCard[item.type] ?? ArticleFeaturedWideGridCard
      : PostTypeToListCard[item.type] ?? ArticleList;
  const Card = cardFor(post);
  const wideProps = isLaptop
    ? { wideColSpan: wideColSpan ?? (isLaptopL ? 5 : 2), hero: true }
    : {};
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
        className="feed-hero-slide-out pointer-events-none col-start-1 row-start-1 flex flex-col"
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
        // The bottom inset the other two columns already carry — the rail on
        // its "Read all" footer, the ad through its card padding. Without it
        // this column's controls run to the section's edge and sit 12px below
        // theirs. Only from `laptop`, where the three share a row.
        'group/hero flex min-w-0 flex-col gap-3 laptop:pb-3',
        className,
      )}
    >
      <div
        className="grid flex-1 laptop:min-h-card"
        // Announcing every automatic rotation would talk over the reader, so
        // only a change the user asked for is live.
        aria-live={isManualChange ? 'polite' : 'off'}
      >
        {outgoingSlide}
        <div
          key={post.id}
          className="feed-hero-slide-in col-start-1 row-start-1 flex flex-col"
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
