import type { ReactElement } from 'react';
import React from 'react';
import PostSourceInfo from './PostSourceInfo';
import type { Post } from '../../graphql/posts';
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
        <ElementPlaceholder className="rounded-10 mt-6 h-6 w-2/4" />
        <ElementPlaceholder className="rounded-16 my-5 w-full pt-[56.25%]" />
      </>
    );
  }

  const isUnknownSource = post.sharedPost.source.id === 'unknown';

  return (
    <>
      <SharePostTitle title={post?.title} titleHtml={post?.titleHtml} />
      <SharedLinkContainer
        className="my-5"
        post={post?.sharedPost}
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
              sharedPost={post?.sharedPost}
              source={post?.source}
              onGoToLinkProps={combinedClicks(onReadArticle)}
              className="typo-body m-4 flex flex-wrap font-bold"
            >
              {post.sharedPost.title}
            </SharedPostLink>
            <PostSourceInfo
              date={
                post.sharedPost.readTime
                  ? `${formatReadTime(post.sharedPost.readTime)} watch time`
                  : undefined
              }
              post={post.sharedPost}
              className="mx-4 mb-4"
              size={ProfileImageSize.Small}
              onReadArticle={onReadArticle}
              showActions={false}
            />
            {children}
          </ConditionalWrapper>
        )}
      >
        <YoutubeVideo
          videoId={post?.sharedPost?.videoId}
          placeholderProps={{
            post: post.sharedPost,
            onWatchVideo: onReadArticle,
          }}
        />
      </SharedLinkContainer>
    </>
  );
}

export default ShareYouTubeContent;
