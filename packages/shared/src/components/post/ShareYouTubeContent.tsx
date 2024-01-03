import React, { ReactElement } from 'react';
import PostSourceInfo from './PostSourceInfo';
import { Post } from '../../graphql/posts';
import { SharePostTitle } from './share';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';
import YoutubeVideo from '../video/YoutubeVideo';
import { formatReadTime } from '../utilities';

interface ShareYouTubeContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
}

function ShareYouTubeContent({ post }: ShareYouTubeContentProps): ReactElement {
  return (
    <>
      <SharePostTitle post={post} />
      <SharedLinkContainer className="my-5" summary={post?.sharedPost?.summary}>
        <YoutubeVideo
          title={post?.sharedPost?.title}
          videoId={post?.sharedPost?.videoId}
        />
        <SharedPostLink
          post={post}
          className="m-4 flex flex-wrap font-bold typo-body"
        >
          {post.sharedPost.title}
        </SharedPostLink>
        <PostSourceInfo
          date={
            post.sharedPost.readTime
              ? `${formatReadTime(post.sharedPost.readTime)} watch time`
              : undefined
          }
          source={post.sharedPost.source}
          className="mx-4 mb-4"
          size="small"
        />
      </SharedLinkContainer>
    </>
  );
}

export default ShareYouTubeContent;
