import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { TweetMedia } from '../../../graphql/posts';
import { TweetMediaType } from '../../../graphql/posts';
import { PlayIcon } from '../../icons';
import { LazyImage } from '../../LazyImage';

export interface TweetMediaGalleryProps {
  media: TweetMedia[];
  className?: string;
}

/**
 * TweetMediaGallery renders tweet media (images and videos) in a responsive grid layout.
 * Supports 1-4 media items with different grid configurations.
 */
export function TweetMediaGallery({
  media,
  className,
}: TweetMediaGalleryProps): ReactElement | null {
  const [expandedMedia, setExpandedMedia] = useState<number | null>(null);

  if (!media || media.length === 0) {
    return null;
  }

  // Grid layout classes based on number of media items
  const getGridClass = () => {
    switch (media.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2';
      case 4:
      default:
        return 'grid-cols-2';
    }
  };

  const handleMediaClick = (index: number, item: TweetMedia) => {
    // For videos, don't expand - open in new tab or play inline
    if (item.type === TweetMediaType.Video || item.type === TweetMediaType.Gif) {
      window.open(item.url, '_blank');
      return;
    }

    setExpandedMedia(expandedMedia === index ? null : index);
  };

  const renderMediaItem = (item: TweetMedia, index: number) => {
    const isVideo =
      item.type === TweetMediaType.Video || item.type === TweetMediaType.Gif;
    const isExpanded = expandedMedia === index;

    // For 3 items, first item spans full row
    const isFirstOfThree = media.length === 3 && index === 0;

    return (
      <button
        key={`${item.url}-${index}`}
        type="button"
        className={classNames(
          'relative overflow-hidden bg-surface-float focus:outline-none',
          isFirstOfThree && 'col-span-2',
          isExpanded && 'col-span-2 row-span-2',
          media.length === 1 ? 'rounded-12' : 'rounded-8',
        )}
        onClick={() => handleMediaClick(index, item)}
        aria-label={
          isVideo ? 'Play video' : isExpanded ? 'Collapse image' : 'Expand image'
        }
      >
        {/* Image or video thumbnail */}
        <LazyImage
          imgSrc={isVideo && item.thumbnail ? item.thumbnail : item.url}
          imgAlt={`Tweet media ${index + 1}`}
          className={classNames(
            'w-full object-cover transition-transform duration-200',
            media.length === 1 ? 'max-h-[512px]' : 'aspect-video',
            !isExpanded && 'hover:scale-105',
          )}
          ratio="auto"
        />

        {/* Video play overlay */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-overlay-quaternary-onion">
            <div className="flex size-14 items-center justify-center rounded-full bg-overlay-primary-onion backdrop-blur-sm">
              <PlayIcon className="size-8 text-text-primary" />
            </div>
            {item.type === TweetMediaType.Gif && (
              <span className="absolute bottom-2 left-2 rounded bg-overlay-primary-onion px-2 py-0.5 text-xs font-bold text-text-primary">
                GIF
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <div
      className={classNames(
        'grid gap-1 overflow-hidden rounded-12',
        getGridClass(),
        className,
      )}
    >
      {media.slice(0, 4).map((item, index) => renderMediaItem(item, index))}
    </div>
  );
}

export default TweetMediaGallery;
