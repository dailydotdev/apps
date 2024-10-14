import React, { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';
import { isVideoPost, Post } from '../../../graphql/posts';
import { CommonCardCoverProps } from './common';
import { CardCover } from './CardCover';

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
  const imageLoadingProps: ComponentProps<'img'> = {
    loading: eagerLoadImage ? 'eager' : 'lazy',
    fetchPriority: eagerLoadImage ? 'high' : 'auto',
  };
  return (
    <>
      <CardCover
        isVideoType={isVideoType}
        onShare={onShare}
        post={post}
        imageProps={{
          ...imageLoadingProps,
          alt: 'Post Cover image',
          src: post.image,
          className: classNames(
            'w-full',
            className.image,
            !isVideoType && 'my-2',
          ),
        }}
        videoProps={{ className: 'my-2' }}
      />
    </>
  );
};
