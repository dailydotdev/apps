import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import OpenLinkIcon from '../icons/OpenLink';
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

  if (!isLoading && !title && !image) return null;

  return (
    <div
      className={classNames(
        'flex gap-4 items-center py-2 px-4 w-full rounded-12 border border-theme-divider-tertiary',
        className,
      )}
    >
      {isLoading ? (
        <div className="flex flex-col flex-1 gap-3">
          <ParagraphPlaceholder />
          <ParagraphPlaceholder />
          <ParagraphPlaceholder className="w-1/3" />
        </div>
      ) : (
        <p className="flex-1 line-clamp-3 multi-truncate text-theme-label-secondary typo-caption1">
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
      <a href={url} target="_blank" rel="noopener noreferrer">
        <OpenLinkIcon
          size={IconSize.Medium}
          className={isLoading && 'text-theme-label-disabled'}
        />
      </a>
    </div>
  );
}

export default PostPreview;
