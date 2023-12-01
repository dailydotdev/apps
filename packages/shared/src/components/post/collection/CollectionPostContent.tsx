import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { LazyImage } from '../../LazyImage';
import {
  ToastSubject,
  useToastNotification,
} from '../../../hooks/useToastNotification';
import PostContentContainer from '../PostContentContainer';
import usePostContent from '../../../hooks/usePostContent';
import FixedPostNavigation from '../FixedPostNavigation';
import { BasePostContent } from '../BasePostContent';
import { cloudinary } from '../../../lib/image';
import { Separator } from '../../cards/common';
import { postDateFormat } from '../../../lib/dateFormat';
import Markdown from '../../Markdown';
import { CollectionPostWidgets } from './CollectionPostWidgets';
import { CollectionPostHeaderActions } from './CollectionPostHeaderActions';
import {
  PostContainer,
  PostContentProps,
  PostNavigationProps,
} from '../common';
import Pill from '../../Pill';
import { CollectionsIntro } from '../widgets';

export const CollectionPostContent = ({
  post,
  className = {},
  shouldOnboardAuthor,
  enableShowShareNewComment,
  origin,
  position,
  inlineActions,
  onPreviousPost,
  onNextPost,
  onClose,
  postPosition,
  isFallback,
  customNavigation,
  onRemovePost,
  backToSquad,
}: PostContentProps): ReactElement => {
  const { subject } = useToastNotification();
  const engagementActions = usePostContent({
    origin,
    post,
  });
  const { updatedAt, contentHtml, image } = post;
  const { onSharePost: onShare, onReadArticle } = engagementActions;

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const containerClass = classNames(
    'tablet:pb-0 tablet:flex-row',
    className?.container,
  );

  const navigationProps: PostNavigationProps = {
    postPosition,
    onPreviousPost,
    onNextPost,
    post,
    onReadArticle,
    onClose,
    onShare,
    inlineActions,
    onRemovePost,
  };

  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={containerClass}
      aria-live={subject === ToastSubject.PostContent ? 'polite' : 'off'}
    >
      {position === 'fixed' && (
        <FixedPostNavigation
          {...navigationProps}
          className={className?.fixedNavigation}
        />
      )}

      <PostContainer
        className={classNames('relative gap-8', className?.content)}
        data-testid="postContainer"
      >
        {!hasNavigation && (
          <CollectionPostHeaderActions
            onShare={onShare}
            post={post}
            onClose={onClose}
            className="flex tablet:hidden"
            contextMenuId="post-widgets-context"
          />
        )}

        <BasePostContent
          className={{
            ...className,
            onboarding: classNames(
              className?.onboarding,
              backToSquad && 'mb-6',
            ),
            navigation: {
              actions: className?.navigation?.actions,
              container: classNames('pt-6', className?.navigation?.container),
            },
          }}
          isFallback={isFallback}
          customNavigation={customNavigation}
          enableShowShareNewComment={enableShowShareNewComment}
          shouldOnboardAuthor={shouldOnboardAuthor}
          navigationProps={navigationProps}
          engagementProps={engagementActions}
          origin={origin}
          post={post}
        >
          <CollectionsIntro className="tablet:hidden" />
          <Pill
            label="Collection"
            className="bg-theme-overlay-float-cabbage text-theme-color-cabbage"
          />

          <h1
            className="font-bold break-words typo-large-title"
            data-testid="post-modal-title"
          >
            {post.title}
          </h1>
          {!!updatedAt && (
            <div className="flex items-center text-theme-label-tertiary typo-footnote">
              <span>Last updated</span> <Separator />
              <time dateTime={updatedAt}>{postDateFormat(updatedAt)}</time>
            </div>
          )}
          {image && (
            <div className="block overflow-hidden w-full h-auto rounded-xl cursor-pointer">
              <LazyImage
                imgSrc={image}
                imgAlt="Post cover image"
                ratio="52%"
                eager
                fallbackSrc={cloudinary.post.imageCoverPlaceholder}
              />
            </div>
          )}
          <Markdown content={contentHtml} />
        </BasePostContent>
      </PostContainer>
      <CollectionPostWidgets
        onShare={onShare}
        post={post}
        className="pb-8"
        onClose={onClose}
        origin={origin}
      />
    </PostContentContainer>
  );
};
