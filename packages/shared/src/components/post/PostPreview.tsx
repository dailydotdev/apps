import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import { OpenLinkIcon } from '../icons';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';
import { IconSize } from '../Icon';
import { ExternalLinkPreview } from '../../graphql/posts';

interface PostPreviewProps {
  preview: Partial<ExternalLinkPreview>;
  className?: string;
  isLoading?: boolean;
}

const LoadingPlaceholder = classed(
  ElementPlaceholder,
  'rounded-16 bg-theme-active',
);

const ParagraphPlaceholder = classed(LoadingPlaceholder, 'w-full h-1.5');

function PostPreview({
  preview,
  className,
  isLoading,
}: PostPreviewProps): ReactElement {
  const { url, title, image } = preview ?? {};
  const imageClassName = 'w-16 laptop:w-24 h-16 rounded-16';

  if (!isLoading && !title) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex w-full items-center gap-4 rounded-12 border border-border-subtlest-tertiary px-4 py-2',
        className,
      )}
    >
      {isLoading ? (
        <div className="flex flex-1 flex-col gap-3">
          <ParagraphPlaceholder />
          <ParagraphPlaceholder />
          <ParagraphPlaceholder className="w-1/3" />
        </div>
      ) : (
        <p className="multi-truncate line-clamp-3 flex-1 text-text-secondary typo-caption1">
          {title}
        </p>
      )}
      {isLoading ? (
        <LoadingPlaceholder className={imageClassName} />
      ) : (
        <Image
          src={image}
          className={classNames('object-cover', imageClassName)}
          loading="lazy"
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
        />
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open link"
      >
        <OpenLinkIcon
          size={IconSize.Medium}
          className={isLoading && 'text-text-disabled'}
        />
      </a>
    </div>
  );
}

export default PostPreview;
