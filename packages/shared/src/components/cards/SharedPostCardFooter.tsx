import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { cloudinary } from '../../lib/image';
import { IconSize } from '../Icon';
import { CardImage, CardVideoImage } from './Card';
import share from '../icons/Share';

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
        'mb-2 flex h-auto min-h-0 w-full flex-auto gap-3 rounded-12 border border-theme-divider-tertiary p-3',
        isShort ? 'flex-row items-center' : 'flex-col  mobileL:flex-row',
      )}
    >
      <div
        className={classNames(
          'text-secondary flex flex-col mobileL:flex-1',
          isShort ? 'line-clamp-4 w-8/12 pr-3' : 'line-clamp-2',
        )}
      >
        {sharedPost.title}
        <span className="text-theme-label-quaternary">
          {sharedPost.summary}
        </span>
      </div>

      <div className={classNames('flex h-auto overflow-auto')}>
        <ImageComponent
          size={isShort ? IconSize.XLarge : IconSize.XXXLarge}
          alt="Shared Post Cover image"
          src={sharedPost.image}
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          className={classNames(
            'h-auto min-h-0 object-cover mobileL:w-56',
            isShort ? 'aspect-square' : 'w-full',
          )}
          {...(isVideoType && { wrapperClassName: 'overflow-hidden' })}
          loading="lazy"
          data-testid="sharedPostImage"
        />
      </div>
    </div>
  );
};
