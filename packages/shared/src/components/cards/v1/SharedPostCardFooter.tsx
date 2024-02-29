import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Post } from '../../../graphql/posts';
import { IconSize } from '../../Icon';
import { CardCover, CommonCardCoverProps } from '../common/CardCover';

interface SharedPostCardFooterProps
  extends Pick<Post, 'sharedPost'>,
    CommonCardCoverProps {
  isVideoType?: boolean;
}

export const SharedPostCardFooter = ({
  sharedPost,
  isVideoType,
  justUpvoted,
  onShare,
  post,
}: SharedPostCardFooterProps): ReactElement => {
  return (
    <div
      className={classNames(
        'mb-2 flex h-auto min-h-0 w-full flex-auto flex-col gap-3 rounded-12 border border-theme-divider-tertiary p-3 mobileL:flex-row',
      )}
    >
      <div className={classNames('flex flex-col mobileL:flex-1')}>
        <span className="line-clamp-1">{sharedPost.title}</span>
      </div>

      <div className={classNames('flex h-20 overflow-auto')}>
        <CardCover
          data-testid="sharedPostImage"
          justUpvoted={justUpvoted}
          isVideoType={isVideoType}
          onShare={onShare}
          post={post}
          imageProps={{
            loading: 'lazy',
            alt: 'Shared Post Cover image',
            src: sharedPost.image,
            className:
              'h-auto min-h-0 w-full object-cover mobileL:w-56 mobileXL:h-auto mobileXL:w-40 mobileXXL:w-56',
          }}
          videoProps={{
            size: IconSize.XXXLarge,
            className: 'mobileXL:w-40 mobileXXL:w-56 !h-fit',
          }}
        />
      </div>
    </div>
  );
};
