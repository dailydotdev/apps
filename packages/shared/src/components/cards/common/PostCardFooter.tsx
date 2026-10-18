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
            !isVideoType && videoProps,
          ),
          ...(eagerLoadImage ? HIGH_PRIORITY_IMAGE_PROPS : { loading: 'lazy' }),
          src: post.image,
        }}
        videoProps={{
          className: videoProps,
        }}
        coverClassName={{
          copy: {
            container: classNames(
              'inset-x-1 rounded-8',
              isVideoType ? 'inset-y-0' : 'bottom-1 top-2',
            ),
          },
        }}
      />
    </>
  );
};
