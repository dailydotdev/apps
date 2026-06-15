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
  // Full-bleed cover classes applied to BOTH the still image and the video
  // wrapper, so a video thumbnail lands edge-to-edge / flush exactly like a
  // regular cover image (the video wrapper otherwise keeps its own
  // mb-1/rounded-12 that `image` classes can't reach).
  cover?: string;
}

interface PostCardFooterProps extends CommonCardCoverProps {
  openNewTab: boolean;
  post: Post;
  className: PostCardFooterClassName;
  eagerLoadImage?: boolean;
}

// When the cover is full-bleed (glass), the video tint must match the image
// exactly: drop the side inset, square the top + round the bottom to the card,
// and darken it a touch for legibility.
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
