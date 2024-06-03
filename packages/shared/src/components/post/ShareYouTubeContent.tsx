import React, { ReactElement } from 'react';
import PostSourceInfo from './PostSourceInfo';
import { Post } from '../../graphql/posts';
import { SharePostTitle } from './share';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';
import YoutubeVideo from '../video/YoutubeVideo';
import { formatReadTime, SelectableLink } from '../utilities';
import { combinedClicks } from '../../lib/click';
import ConditionalWrapper from '../ConditionalWrapper';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { ProfileImageSize } from '../ProfilePicture';

interface ShareYouTubeContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
}

function ShareYouTubeContent({
  post,
  onReadArticle,
}: ShareYouTubeContentProps): ReactElement {
  if (!post.sharedPost?.id) {
    return (
      <>
        <ElementPlaceholder className="mt-6 h-6 w-2/4 rounded-10" />
        <ElementPlaceholder className="my-5 w-full rounded-16 pt-[56.25%]" />
      </>
    );
  }

  const isUnknownSource = post.sharedPost.source.id === 'unknown';

  return (
    <>
      <SharePostTitle post={post} />
      <SharedLinkContainer
        className="my-5"
        summary={post?.sharedPost?.summary}
        Wrapper={({ children }) => (
          <ConditionalWrapper
            condition={!isUnknownSource}
            wrapper={(comp) => (
              <SelectableLink href={post.sharedPost.commentsPermalink}>
                {comp}
              </SelectableLink>
            )}
          >
            <SharedPostLink
              post={post}
              onGoToLinkProps={combinedClicks(onReadArticle)}
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
              size={ProfileImageSize.Small}
            />
            {children}
          </ConditionalWrapper>
        )}
      >
        <YoutubeVideo
          title={post?.sharedPost?.title}
          videoId={post?.sharedPost?.videoId}
        />
      </SharedLinkContainer>
    </>
  );
}

export default ShareYouTubeContent;
