import type { ReactElement } from 'react';
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
  className?: string;
};

const wrapIndex = (index: number, total: number): number =>
  (index + total) % total;

export const FeedHeroCarousel = ({
  posts,
  className,
  wideColSpan = 2,
  ...cardProps
}: FeedHeroCarouselProps): ReactElement | null => {
  const [index, setIndex] = useState(0);
  // Below laptop the feed itself renders list cards, so the featured post does
  // too — a two-column wide card leaves the headline about 180px on a phone.
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (!posts.length) {
    return null;
  }

  const total = posts.length;
  const active = wrapIndex(index, total);
  const post = posts[active];
  const Card = isLaptop
    ? PostTypeToWideCard[post.type] ?? ArticleFeaturedWideGridCard
    : PostTypeToListCard[post.type] ?? ArticleList;
  const previous = posts[wrapIndex(active - 1, total)];
  const next = posts[wrapIndex(active + 1, total)];

  return (
    <section
      aria-label="Featured posts"
      aria-roledescription="carousel"
      className={classNames('flex min-w-0 flex-col gap-3', className)}
    >
      <div
        className="flex flex-1 flex-col laptop:min-h-card"
        aria-live="polite"
      >
        <Card
          key={post.id}
          post={post}
          {...(isLaptop && { wideColSpan, coverImage: true })}
          {...cardProps}
        />
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
                onClick={() => setIndex(position)}
                className={classNames(
                  'h-1.5 rounded-max transition-all',
                  position === active
                    ? 'w-6 bg-text-primary'
                    : 'w-1.5 bg-border-subtlest-primary hover:bg-text-quaternary',
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip content={previous.title}>
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<ArrowIcon className="-rotate-90" />}
                onClick={() => setIndex(active - 1)}
                aria-label={`Previous: ${previous.title}`}
              />
            </Tooltip>
            <Tooltip content={next.title}>
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<ArrowIcon className="rotate-90" />}
                onClick={() => setIndex(active + 1)}
                aria-label={`Next: ${next.title}`}
              />
            </Tooltip>
          </div>
        </div>
      )}
    </section>
  );
};
