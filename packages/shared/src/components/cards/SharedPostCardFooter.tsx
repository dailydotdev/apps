import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { cloudinary } from '../../lib/image';
import { CardImage } from './Card';

type SharedPostCardFooterProps = {
  isShort: boolean;
  isVideoType?: boolean;
} & Pick<Post, 'sharedPost'>;

export const SharedPostCardFooter = ({
  sharedPost,
  isShort,
  isVideoType,
}: SharedPostCardFooterProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex flex-1 gap-2 p-3 mb-2 rounded-12 border border-theme-divider-tertiary',
        isShort ? 'flex-row items-center' : 'flex-col',
      )}
    >
      <span
        className={classNames(
          'typo-footnote text-theme-label-secondary',
          isShort ? 'line-clamp-4 flex-1' : 'line-clamp-2',
        )}
      >
        {sharedPost.title}
      </span>

      <CardImage
        alt="Post Cover image"
        src={sharedPost.image}
        fallbackSrc={cloudinary.post.imageCoverPlaceholder}
        className={classNames(
          'object-cover my-2 w-full',
          isShort ? 'w-auto h-full aspect-square' : 'flex-1',
        )}
        loading="lazy"
        isVideoType={isVideoType}
        data-testid="postImage"
      />
    </div>
  );
};
