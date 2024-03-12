import React, { ReactElement } from 'react';
import Link from 'next/link';
import { Post, PostType } from '../../../graphql/posts';
import { CardCover } from '../common/CardCover';
import { IconSize } from '../../Icon';
import PostReadTime from '../v1/PostReadTime';
import { PostEngagementCounts } from './PostEngagementCounts';
import { usePostImage } from '../../../hooks/post/usePostImage';

interface SidePostProps {
  post: Post;
  onLinkClick: () => void;
}

export function SidePost({ post, onLinkClick }: SidePostProps): ReactElement {
  const isVideoType = post.type === PostType.VideoYouTube;
  const image = usePostImage(post);

  return (
    <Link href={post.commentsPermalink} passHref>
      <a
        className="flex flex-col gap-2 text-text-quaternary typo-footnote"
        href={post.commentsPermalink}
        onClick={onLinkClick}
      >
        <CardCover
          isVideoType={isVideoType}
          imageProps={{
            loading: 'lazy',
            alt: `Cover preview of: ${post.title}`,
            src: image,
            className: 'w-full !h-24 !rounded-8',
          }}
          videoProps={{ size: IconSize.Large }}
        />
        <h3 className="line-clamp-3 font-bold text-text-primary typo-subhead">
          {post.title}
        </h3>
        <PostEngagementCounts
          className="mt-auto text-text-quaternary"
          upvotes={post.numUpvotes}
          comments={post.numComments}
        />
        <PostReadTime readTime={post.readTime} isVideoType={isVideoType} />
      </a>
    </Link>
  );
}
