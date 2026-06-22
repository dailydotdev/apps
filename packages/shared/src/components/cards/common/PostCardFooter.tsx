import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { isVideoPost } from '../../../graphql/posts';
import type { CommonCardCoverProps } from './common';
import { CardCover } from './CardCover';
import { HIGH_PRIORITY_IMAGE_PROPS } from '../../image/Image';

interface PostCardFooterClassName {
  image?: string;
  // Applied to both the still image and the video wrapper so a video thumbnail
  // lands full-bleed too (the wrapper's own margin/radius isn't reachable via
  // `image`).
  cover?: string;
}

interface PostCardFooterProps extends CommonCardCoverProps {
  openNewTab: boolean;
  post: Post;
  className: PostCardFooterClassName;
  eagerLoadImage?: boolean;
}

// Full-bleed video tint matching the image crop, darkened for legibility.
const glassVideoOverlay =
  '!inset-x-0 !rounded-t-none !rounded-b-16 !bg-overlay-secondary-black';

export const PostCardFooter = ({
  className,
  eagerLoadImage = false,
  onShare,
  post,
}: PostCardFooterProps): ReactElement => {
  const isVideoType = isVideoPost(post);

  const videoProps = 'mb-1 mt-2';

  return (
    <>
      <CardCover
        isVideoType={isVideoType}
        onShare={onShare}
        post={post}
        // A glass cover (set via `className.cover`) has the action bar floating
        // over its bottom; reserve its height so the share buttons clear it.
        shareCoverClassName={className.cover ? 'pb-12' : undefined}
        imageProps={{
          alt: 'Post Cover image',
          className: classNames(
            'w-full',
            className.image,
            className.cover,
            !isVideoType && videoProps,
          ),
          ...(eagerLoadImage ? HIGH_PRIORITY_IMAGE_PROPS : { loading: 'lazy' }),
          src: post.image,
        }}
        videoProps={{
          className: classNames(videoProps, className.cover),
          overlayClassName: className.cover ? glassVideoOverlay : undefined,
        }}
      />
    </>
  );
};
