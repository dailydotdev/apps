import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Post } from '../../../graphql/posts';
import { IconSize } from '../../Icon';
import { CommonCardCoverProps } from '../common';
import { CardCoverList } from './CardCover';

interface SharedPostCardFooterProps
  extends Pick<Post, 'sharedPost'>,
    CommonCardCoverProps {
  isVideoType?: boolean;
}

export const SharedPostCardFooter = ({
  sharedPost,
  isVideoType,
  onShare,
  post,
}: SharedPostCardFooterProps): ReactElement => {
  return (
    <div
      className={classNames(
        'mb-2 flex h-auto min-h-0 w-full flex-auto flex-col gap-3 rounded-12 border border-border-subtlest-tertiary p-3 mobileXXL:flex-row',
      )}
    >
      <div className={classNames('flex flex-col mobileXL:flex-1')}>
        <span className="line-clamp-1">{sharedPost.title}</span>
      </div>
      <CardCoverList
        data-testid="sharedPostImage"
        isVideoType={isVideoType}
        onShare={onShare}
        post={post}
        imageProps={{
          loading: 'lazy',
          alt: 'Shared Post Cover image',
          src: sharedPost.image,
          className:
            'w-full mobileXXL:!w-40 mobileXXL:!h-20 mobileXXL:!min-h-0',
        }}
        videoProps={{ size: IconSize.XXXLarge, className: '!w-auto' }}
        className="flex-1 justify-center"
      />
    </div>
  );
};
