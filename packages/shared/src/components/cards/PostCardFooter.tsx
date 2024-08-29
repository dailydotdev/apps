import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { isVideoPost, Post } from '../../graphql/posts';
import { CommonCardCoverProps } from './common';
import { CardCover } from './common/CardCover';

interface PostCardFooterClassName {
  image?: string;
}

interface PostCardFooterProps extends CommonCardCoverProps {
  openNewTab: boolean;
  post: Post;
  className: PostCardFooterClassName;
}

export const PostCardFooter = ({
  post,
  className,
  onShare,
}: PostCardFooterProps): ReactElement => {
  const isVideoType = isVideoPost(post);
  return (
    <>
      <CardCover
        isVideoType={isVideoType}
        onShare={onShare}
        post={post}
        imageProps={{
          loading: 'lazy',
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
