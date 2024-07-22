import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { FeatherIcon } from '../icons';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { isVideoPost, Post } from '../../graphql/posts';
import { CommonCardCoverProps, visibleOnGroupHover } from './common';
import { CardCover } from './common/CardCover';
import { useConditionalFeature } from '../../hooks';
import { feature } from '../../lib/featureManagement';

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
  const { value: shouldShowImage } = useConditionalFeature({
    shouldEvaluate: !!post?.author,
    feature: feature.authorImage,
  });
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
      {/* hide the existing hover behavior */}
      {!shouldShowImage && post.author && (
        <div
          className={classNames(
            'absolute z-1 mt-2 flex w-full items-center rounded-t-12 bg-background-default px-3 py-2 font-bold text-text-secondary typo-callout',
            visibleOnGroupHover,
          )}
        >
          <ProfilePicture size={ProfileImageSize.Small} user={post.author} />
          <span className="mx-3 flex-1 truncate">{post.author.name}</span>
          <FeatherIcon secondary className="text-2xl text-status-help" />
        </div>
      )}
    </>
  );
};
