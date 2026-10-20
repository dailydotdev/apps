import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Image } from '../image/Image';
import type { ImageProps } from '../image/Image';
import { useImageViewer } from '../../hooks/useImageViewer';
import { isPlaceholderImage } from '../../lib/image';

interface PostImageProps extends Pick<ImageProps, 'loading' | 'fetchPriority'> {
  src?: string;
  alt?: string;
  className?: string;
}

export function PostImage({
  src,
  alt = 'Post cover image',
  className,
  loading = 'lazy',
  fetchPriority,
}: PostImageProps): ReactElement | null {
  const openImage = useImageViewer();

  if (!src || isPlaceholderImage(src)) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Open image"
      className={classNames(
        'block w-fit max-w-full cursor-zoom-in overflow-hidden rounded-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
        className,
      )}
      onClick={(event) => {
        event.stopPropagation();
        openImage(src, alt, event.currentTarget);
      }}
    >
      <Image
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        className="block h-auto max-h-img-mobile w-auto max-w-full object-contain tablet:max-h-img-desktop"
      />
    </button>
  );
}
