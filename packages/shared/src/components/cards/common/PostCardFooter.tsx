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
}

interface PostCardFooterProps extends CommonCardCoverProps {
  openNewTab: boolean;
  post: Post;
  className: PostCardFooterClassName;
  eagerLoadImage?: boolean;
}

export const PostCardFooter = ({
  className,
  eagerLoadImage = false,
  onShare,
  post,
}: PostCardFooterProps): ReactElement => {
  const isVideoType = isVideoPost(post);

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
            !isVideoType && 'my-2',
          ),
          ...(eagerLoadImage ? HIGH_PRIORITY_IMAGE_PROPS : { loading: 'lazy' }),
          src: post.image,
        }}
        videoProps={{ className: 'my-2' }}
      />
    </>
  );
};
