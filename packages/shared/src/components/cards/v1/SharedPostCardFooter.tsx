import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Post } from '../../../graphql/posts';
import { cloudinary } from '../../../lib/image';
import { IconSize } from '../../Icon';
import { CardImage, CardVideoImage } from './Card';

type SharedPostCardFooterProps = {
  isVideoType?: boolean;
} & Pick<Post, 'sharedPost'>;

export const SharedPostCardFooter = ({
  sharedPost,
  isVideoType,
}: SharedPostCardFooterProps): ReactElement => {
  const ImageComponent = isVideoType ? CardVideoImage : CardImage;
  return (
    <div
      className={classNames(
        'mb-2 flex h-auto min-h-0 w-full flex-auto flex-col gap-3 rounded-12 border border-theme-divider-tertiary p-3  mobileL:flex-row',
      )}
    >
      <div className={classNames('flex flex-col mobileL:flex-1')}>
        <span className="line-clamp-1">{sharedPost.title}</span>
      </div>

      <div className={classNames('flex h-20 overflow-auto')}>
        <ImageComponent
          size={IconSize.XXXLarge}
          alt="Shared Post Cover image"
          src={sharedPost.image}
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          className={classNames(
            'h-auto min-h-0 w-full object-cover mobileL:w-56 mobileXL:h-auto mobileXL:w-40 mobileXXL:w-56',
          )}
          {...(isVideoType && {
            wrapperClassName: 'mobileXL:w-40 mobileXXL:w-56 !h-fit',
          })}
          loading="lazy"
          data-testid="sharedPostImage"
        />
      </div>
    </div>
  );
};
