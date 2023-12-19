import React, { ReactElement, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import PostSourceInfo from './PostSourceInfo';
import { Post, sendViewPost } from '../../graphql/posts';
import { SharePostTitle } from './share';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';
import YoutubeVideo from '../video/YoutubeVideo';
import { formatReadTime } from '../utilities';
import { useAuthContext } from '../../contexts/AuthContext';

interface ShareYouTubeContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
}

function ShareYouTubeContent({ post }: ShareYouTubeContentProps): ReactElement {
  const { user } = useAuthContext();
  const { mutateAsync: onSendViewPost } = useMutation(sendViewPost);

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [onSendViewPost, post.id, user?.id]);

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
          className="flex flex-wrap m-4 font-bold typo-body"
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
