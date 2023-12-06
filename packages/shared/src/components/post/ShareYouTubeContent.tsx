import React, { ReactElement } from 'react';
import PostSourceInfo from './PostSourceInfo';
import { Post } from '../../graphql/posts';
import { SharePostTitle } from './share';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';

interface ShareYouTubeContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
}

function ShareYouTubeContent({ post }: ShareYouTubeContentProps): ReactElement {
  return (
    <>
      <SharePostTitle post={post} />
      <SharedLinkContainer summary={post?.sharedPost?.summary}>
        <iframe
          title={post?.sharedPost?.title}
          src={`https://www.youtube-nocookie.com/embed/${post?.sharedPost?.videoId}`}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className="w-full rounded-16 border-0"
        />
        <SharedPostLink
          post={post}
          className="flex flex-wrap mt-4 laptop:mt-0 mb-4 font-bold typo-body"
        >
          {post.sharedPost.title}
        </SharedPostLink>
        <PostSourceInfo
          date={
            post.sharedPost.readTime
              ? `${post.sharedPost.readTime}m watch time`
              : undefined
          }
          source={post.sharedPost.source}
          size="small"
        />
      </SharedLinkContainer>
    </>
  );
}

export default ShareYouTubeContent;
