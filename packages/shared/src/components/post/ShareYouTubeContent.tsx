import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import { SharePostTitle } from './share';
import { SharedLinkContainer } from './common/SharedLinkContainer';
import { SharedPostLink } from './common/SharedPostLink';
import { SharedPostMetaInfo } from './common/SharedPostMetaInfo';
import YoutubeVideo from '../video/YoutubeVideo';
import { combinedClicks } from '../../lib/click';
import { ElementPlaceholder } from '../ElementPlaceholder';

interface ShareYouTubeContentProps {
  post: Post;
  onReadArticle: () => Promise<void>;
  isCompactSpacing?: boolean;
}

const ShareYouTubeSkeleton = () => (
  <>
    <ElementPlaceholder className="mt-6 h-6 w-2/4 rounded-10" />
    <div className="mb-5 mt-8 overflow-hidden rounded-16 border border-border-subtlest-tertiary">
      <ElementPlaceholder className="w-full pt-[56.25%]" />
      <div className="flex flex-col gap-3 p-4 tablet:gap-4 tablet:p-5">
        <ElementPlaceholder className="h-7 w-3/4 rounded-10 tablet:h-8" />
        <ElementPlaceholder className="h-5 w-24 rounded-10" />
      </div>
    </div>
  </>
);

function ShareYouTubeContent({
  post,
  onReadArticle,
  isCompactSpacing,
}: ShareYouTubeContentProps): ReactElement {
  const { sharedPost, source } = post;
  const videoId = sharedPost?.videoId;
  if (!sharedPost?.id || !videoId) {
    return <ShareYouTubeSkeleton />;
  }
  const onCardClick = (e: React.MouseEvent) => {
    const selection = globalThis?.window?.getSelection();
    const hasSelection =
      !!selection && selection.anchorOffset !== selection.focusOffset;
    if (hasSelection) {
      e.preventDefault();
    }
  };

  return (
    <>
      <SharePostTitle
        title={post?.title}
        titleHtml={post?.titleHtml}
        isCompactSpacing={isCompactSpacing}
      />
      <SharedLinkContainer
        className={classNames(
          isCompactSpacing ? 'mb-4 mt-6' : 'mb-5 mt-8',
          'min-w-0 max-w-full overflow-hidden',
        )}
      >
        <YoutubeVideo
          videoId={videoId}
          placeholderProps={{
            post: sharedPost,
            onWatchVideo: onReadArticle,
          }}
        />
        <SharedPostLink
          source={source}
          sharedPost={sharedPost}
          onGoToLinkProps={combinedClicks(onCardClick)}
          className="block w-full cursor-pointer"
        >
          <div className="flex min-w-0 max-w-full flex-col gap-3 p-4 tablet:gap-4 tablet:p-5">
            <h3 className="break-words font-bold typo-title3 tablet:typo-title2">
              {sharedPost.title}
            </h3>
            <SharedPostMetaInfo
              sharedPost={sharedPost}
              readTimeUnit="watch"
            />
            {!!sharedPost.summary && (
              <p
                className="select-text break-words text-text-secondary typo-markdown"
                data-testid="tldr-container"
              >
                {sharedPost.summary}
              </p>
            )}
          </div>
        </SharedPostLink>
      </SharedLinkContainer>
    </>
  );
}

export default ShareYouTubeContent;
