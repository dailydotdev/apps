import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { FeatherIcon } from '../icons';
import PostAuthor from './PostAuthor';
import { ProfilePicture } from '../ProfilePicture';
import { Post, isVideoPost } from '../../graphql/posts';
import { CommonCardCoverProps, visibleOnGroupHover } from './common';
import { CardCover } from './common/CardCover';

interface PostCardFooterClassName {
  image?: string;
}

interface PostCardFooterProps extends CommonCardCoverProps {
  insaneMode: boolean;
  openNewTab: boolean;
  showImage: boolean;
  post: Post;
  className: PostCardFooterClassName;
}

export const PostCardFooter = ({
  post,
  showImage,
  className,
  onShare,
}: PostCardFooterProps): ReactElement => {
  const isVideoType = isVideoPost(post);
  return (
    <>
      {!showImage && post.author && (
        <PostAuthor
          author={post.author}
          className={classNames(
            'mx-4 mt-2 hidden tablet:flex laptop:hidden',
            visibleOnGroupHover,
          )}
        />
      )}
      {showImage && (
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
      )}
      {showImage && post.author && (
        <div
          className={classNames(
            'absolute z-1 mt-2 flex w-full items-center rounded-t-12 bg-background-default px-3 py-2 font-bold text-theme-label-secondary typo-callout',
            visibleOnGroupHover,
          )}
        >
          <ProfilePicture size="small" user={post.author} />
          <span className="mx-3 flex-1 truncate">{post.author.name}</span>
          <FeatherIcon secondary className="text-2xl text-status-help" />
        </div>
      )}
    </>
  );
};
