import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { modalSizeToClassName } from '../modals/common/Modal';
import { PostNavigationProps } from './PostNavigation';
import { postDateFormat } from '../../lib/dateFormat';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import { ModalSize } from '../modals/common/types';
import FixedPostNavigation from './FixedPostNavigation';
import { UserShortInfo } from '../profile/UserShortInfo';
import PostSummary from '../cards/PostSummary';
import { LazyImage } from '../LazyImage';
import { ReadArticleButton } from '../cards/ReadArticleButton';
import ArrowIcon from '../icons/Arrow';
import PostSourceInfo from './PostSourceInfo';
import { PostContentProps } from './PostContent';
import { BasePostContent } from './BasePostContent';

function SquadPostContent({
  post,
  isFallback,
  shouldOnboardAuthor,
  enableShowShareNewComment,
  isLoading,
  origin,
  position,
  inlineActions,
  className,
  onPreviousPost,
  onNextPost,
  onClose,
}: PostContentProps): ReactElement {
  if (isLoading) return <>loading</>;

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const [height, setHeight] = useState<number>(null);
  const [shoudShowSummary, setShouldShowSummary] = useState(true);
  const engagementActions = usePostContent({ origin, post });
  const { onReadArticle, onSharePost, onToggleBookmark } = engagementActions;

  const navigationProps: PostNavigationProps = {
    post,
    onBookmark: onToggleBookmark,
    onPreviousPost,
    onNextPost,
    onShare: onSharePost,
    onClose,
    inlineActions,
  };

  const getHeight = () => {
    if (height === null) return 'auto';

    return shoudShowSummary ? height : 0;
  };

  return (
    <>
      {position === 'fixed' && (
        <FixedPostNavigation
          {...navigationProps}
          onReadArticle={onReadArticle}
          className={{
            container: modalSizeToClassName[ModalSize.Large],
          }}
        />
      )}

      <PostContentContainer
        className="relative py-4 px-6 post-content"
        hasNavigation={hasNavigation}
      >
        <BasePostContent
          className={{
            ...className,
            onboarding: 'mt-4 mb-6',
            navigation: { actions: 'ml-auto', container: 'mb-6' },
          }}
          isLoading={isLoading}
          isFallback={isFallback}
          enableShowShareNewComment={enableShowShareNewComment}
          shouldOnboardAuthor={shouldOnboardAuthor}
          navigationProps={navigationProps}
          engagementProps={engagementActions}
          origin={origin}
          post={post}
        >
          <PostSourceInfo
            date={postDateFormat(post.createdAt)}
            source={post.source}
          />
          <UserShortInfo
            className="items-center pt-3"
            imageSize="xxlarge"
            user={post.author}
          />
          <p className="mt-6 typo-title3">{post.title}</p>
          <div className="flex flex-col mt-8 rounded-16 border border-theme-divider-tertiary">
            <span className="flex flex-row p-4 max-w-full">
              <div className="flex flex-col flex-1">
                <h2 className="flex flex-wrap mb-4 font-bold line-clamp-2 typo-body">
                  {post.sharedPost.title}
                </h2>
                <PostSourceInfo
                  date={`${post.sharedPost.readTime}m read time`}
                  source={post.source}
                  typo="typo-footnote"
                  size="small"
                />
                <ReadArticleButton
                  buttonSize="medium"
                  className="mt-5 btn-secondary w-fit"
                  href={post.sharedPost.permalink}
                />
              </div>
              <a
                href={post.sharedPost.permalink}
                title="Go to article"
                target="_blank"
                rel="noopener"
                onClick={onReadArticle}
                className="block overflow-hidden w-70 rounded-2xl cursor-pointer"
              >
                <LazyImage
                  imgSrc={post.image}
                  imgAlt="Post cover image"
                  ratio="52%"
                  eager
                  fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
                />
              </a>
            </span>
            {post.sharedPost.summary && (
              <PostSummary
                ref={(el) => {
                  if (!el?.offsetHeight || height !== null) return;

                  setHeight(el.offsetHeight);
                }}
                style={{ height: getHeight() }}
                className="m-4 mt-0 transition-all duration-150 ease-in-out"
                summary={post.sharedPost.summary}
              />
            )}
            <button
              type="button"
              className="flex flex-row justify-center py-2 w-full font-bold hover:underline border-t border-theme-divider-tertiary typo-callout"
              onClick={() => setShouldShowSummary(!shoudShowSummary)}
            >
              {shoudShowSummary ? 'Hide' : 'Show'} TLDR{' '}
              <ArrowIcon
                className={classNames(
                  'ml-2',
                  !shoudShowSummary && 'rotate-180',
                )}
              />
            </button>
          </div>
        </BasePostContent>
      </PostContentContainer>
    </>
  );
}

export default SquadPostContent;
