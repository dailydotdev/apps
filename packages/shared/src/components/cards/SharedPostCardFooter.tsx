import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { IconSize } from '../Icon';
import { CardCover } from './common/CardCover';
import { CommonCardCoverProps } from './common';

interface SharedPostCardFooterProps
  extends Pick<Post, 'sharedPost'>,
    CommonCardCoverProps {
  isShort: boolean;
  isVideoType?: boolean;
  justUpvoted?: boolean;
}

export const SharedPostCardFooter = ({
  sharedPost,
  isShort,
  isVideoType,
  justUpvoted,
  onShare,
  post,
}: SharedPostCardFooterProps): ReactElement => {
  return (
    <div
      className={classNames(
        'mb-2 flex h-auto min-h-0 w-full flex-auto gap-3 rounded-12 border border-theme-divider-tertiary p-3',
        isShort ? 'flex-row items-center' : 'flex-col',
      )}
    >
      <div
        className={classNames(
          'flex text-theme-label-secondary typo-footnote',
          isShort ? 'line-clamp-4 w-8/12 pr-3' : 'line-clamp-2',
        )}
      >
        {sharedPost.title}
      </div>

      <div className={classNames('flex h-auto flex-auto overflow-auto')}>
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
            className: classNames(
              'h-auto min-h-0 object-cover',
              isShort ? 'aspect-square' : 'w-full',
            ),
          }}
          videoProps={{
            size: isShort ? IconSize.XLarge : IconSize.XXXLarge,
            className: 'overflow-hidden',
          }}
        />
      </div>
    </div>
  );
};
