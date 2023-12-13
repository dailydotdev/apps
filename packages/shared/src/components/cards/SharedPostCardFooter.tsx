import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { cloudinary } from '../../lib/image';
import { IconSize } from '../Icon';
import { CardImage, CardVideoImage } from './Card';

type SharedPostCardFooterProps = {
  isShort: boolean;
  isVideoType?: boolean;
} & Pick<Post, 'sharedPost'>;

export const SharedPostCardFooter = ({
  sharedPost,
  isShort,
  isVideoType,
}: SharedPostCardFooterProps): ReactElement => {
  const ImageComponent = isVideoType ? CardVideoImage : CardImage;
  return (
    <div
      className={classNames(
        'p-3 gap-3 mb-2 rounded-12 border border-theme-divider-tertiary flex w-fit flex-auto h-auto min-h-0',
        isShort ? 'flex-row items-center' : 'flex-col',
      )}
    >
      <div
        className={classNames(
          'typo-footnote text-theme-label-secondary flex',
          isShort ? 'line-clamp-4 pr-3 w-8/12' : 'line-clamp-2',
        )}
      >
        {sharedPost.title}
      </div>

      <div className={classNames('flex flex-auto h-auto overflow-auto')}>
        <ImageComponent
          size={isShort ? IconSize.XLarge : IconSize.XXXLarge}
          alt="Shared Post Cover image"
          src={sharedPost.image}
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          className={classNames(
            'object-cover h-auto min-h-0',
            isShort ? 'aspect-square' : 'w-full',
          )}
          wrapperClassName="overflow-hidden"
          loading="lazy"
          data-testid="sharedPostImage"
        />
      </div>
    </div>
  );
};
