import classNames from 'classnames';
import React, { CSSProperties, ReactElement, ReactNode, useMemo } from 'react';
import { Post } from '../../../graphql/posts';
import { LazyImage } from '../../LazyImage';
import { PostNavigationProps } from '../PostNavigation';
import {
  PostHeaderActions,
  PostHeaderActionsProps,
} from '../PostHeaderActions';
import {
  ToastSubject,
  useToastNotification,
} from '../../../hooks/useToastNotification';
import PostContentContainer from '../PostContentContainer';
import { PostOrigin } from '../../../hooks/analytics/useAnalyticsContextData';
import usePostContent from '../../../hooks/usePostContent';
import FixedPostNavigation from '../FixedPostNavigation';
import { BasePostContent, PostContentClassName } from '../BasePostContent';
import classed from '../../../lib/classed';
import { cloudinary } from '../../../lib/image';
import { Separator } from '../../cards/common';
import { postDateFormat } from '../../../lib/dateFormat';
import Markdown from '../../Markdown';
import CollectionPostWidgets from './CollectionPostWidgets';

export type PassedPostNavigationProps = Pick<
  PostNavigationProps,
  'onNextPost' | 'onPreviousPost' | 'postPosition' | 'onRemovePost'
>;

export interface PostContentProps
  extends Pick<PostHeaderActionsProps, 'onClose' | 'inlineActions'>,
    PassedPostNavigationProps {
  enableShowShareNewComment?: boolean;
  post?: Post;
  isFallback?: boolean;
  className?: PostContentClassName;
  origin: PostOrigin;
  shouldOnboardAuthor?: boolean;
  customNavigation?: ReactNode;
  position?: CSSProperties['position'];
  backToSquad?: boolean;
}

const PostContainer = classed(
  'main',
  'flex flex-col flex-1 px-4 tablet:px-8 tablet:border-r tablet:border-theme-divider-tertiary',
);

const CollectionPostContent = ({
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
  // const { createdAt, contentHtml, image } = post;
  // TODO: remove this and uncomment the above
  const { createdAt, image } = post;
  const contentHtml =
    '<p>Welcome to Web team, a dedicated space to collaborate, share knowledge, and discuss topics that matter to us!</p>\n<p>Here are some of the things you can do in Squads:</p>\n<p>Say hi: Start by saying hi in the comments below so that we’ll know you’re here\nCreate a new post: Share interesting links and your thoughts by creating a new post in the squad\nInteract with others: Comment and upvote on other members’ posts and give feedback\nPersonalize it: Customize your profile by adding a profile picture, bio, and links to your projects or social media\nInvite other developers you know and appreciate that you think can benefit from this squad</p>\n<p>Now that you know what you can do in this squad, we’ve put together a code of conduct that we expect all of our squad members to follow:</p>\n<p>Keep it relevant: Keep your posts and comments relevant to the topic of the Squad. Please refrain from spamming or promoting unrelated content.\nBe respectful: Treat others the way you want to be treated. We do not tolerate hate speech, discrimination, or harassment of any kind.\nBe constructive: Offer helpful feedback and constructive criticism rather than tearing others down.\nProtect your privacy: Do not share personal information or sensitive data in Squads.</p>\n<p>We hope you will find Web team useful! test</p>\n';
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

  const date = useMemo(
    () => createdAt && postDateFormat(createdAt),
    [createdAt],
  );

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
          <PostHeaderActions
            onShare={onShare}
            onReadArticle={onReadArticle}
            post={post}
            onClose={onClose}
            className="flex tablet:hidden mb-4"
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
          {/* TODO: replace <div>Collection</div> with the right pill */}
          <div>Collection</div>

          <h1
            className="font-bold break-words typo-large-title"
            data-testid="post-modal-title"
          >
            {post.title}
          </h1>
          <div className="flex items-center text-theme-label-tertiary typo-callout">
            <span>Last updated</span> <Separator />
            {/* TODO: change this with metadataChangedAt */}
            {!!createdAt && <time dateTime={createdAt}>{date}</time>}
          </div>
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

export default CollectionPostContent;
