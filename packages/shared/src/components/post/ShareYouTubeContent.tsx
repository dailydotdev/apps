import React, { ReactElement } from 'react';
import PostSourceInfo from './PostSourceInfo';
import { Post } from '../../graphql/posts';
import { SharePostTitle } from './share';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';
import YoutubeVideo from '../video/YoutubeVideo';

interface ShareYouTubeContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
}

function ShareYouTubeContent({ post }: ShareYouTubeContentProps): ReactElement {
  return (
    <>
      <SharePostTitle post={post} />
      <SharedLinkContainer summary={post?.sharedPost?.summary}>
        <YoutubeVideo
          title={post?.sharedPost?.title}
          videoId={post?.sharedPost?.videoId}
        />
        <SharedPostLink
          post={post}
          className="flex flex-wrap m-4 laptop:mt-0 font-bold typo-body"
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
          className="mx-4"
          size="small"
        />
      </SharedLinkContainer>
    </>
  );
}

export default ShareYouTubeContent;
