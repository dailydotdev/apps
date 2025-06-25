import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import Link from '../../utilities/Link';
import { LazyImage } from '../../LazyImage';
import { ToastSubject, useToastNotification } from '../../../hooks';
import PostContentContainer from '../PostContentContainer';
import usePostContent from '../../../hooks/usePostContent';
import { BasePostContent } from '../BasePostContent';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { Separator } from '../../cards/common/common';
import { TimeFormatType } from '../../../lib/dateFormat';
import Markdown from '../../Markdown';
import { CollectionPostWidgets } from './CollectionPostWidgets';
import type { PostContentProps, PostNavigationProps } from '../common';
import { PostContainer } from '../common';
import { Pill } from '../../Pill';
import { CollectionsIntro } from '../widgets';
import { useAuthContext } from '../../../contexts/AuthContext';
import { webappUrl } from '../../../lib/constants';
import { useViewPost } from '../../../hooks/post/useViewPost';
import { DateFormat } from '../../utilities';
import { withPostById } from '../withPostById';
import { PostTagList } from '../tags/PostTagList';
import { CollectionPostHeaderActions } from './CollectionPostHeaderActions';

const CollectionPostContentRaw = ({
  post,
  className = {},
  shouldOnboardAuthor,
  origin,
  position,
  inlineActions,
  onPreviousPost,
  onNextPost,
  onClose,
  postPosition,
  isFallback,
  customNavigation,
  backToSquad,
  isBannerVisible,
  isPostPage,
}: PostContentProps): ReactElement => {
  const { user } = useAuthContext();
  const { subject } = useToastNotification();
  const engagementActions = usePostContent({
    origin,
    post,
  });
  const { updatedAt, contentHtml, image } = post;
  const { onCopyPostLink, onReadArticle } = engagementActions;

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const containerClass = classNames(
    'laptop:flex-row laptop:pb-0',
    className?.container,
  );

  const navigationProps: PostNavigationProps = {
    postPosition,
    onPreviousPost,
    onNextPost,
    post,
    onReadArticle,
    onClose,
    inlineActions,
  };

  const onSendViewPost = useViewPost();

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post?.id, onSendViewPost, user?.id]);

  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={containerClass}
      aria-live={subject === ToastSubject.PostContent ? 'polite' : 'off'}
      navigationProps={
        position === 'fixed'
          ? {
              ...navigationProps,
              isBannerVisible,
              className: className?.fixedNavigation,
            }
          : null
      }
    >
      <PostContainer
        className={classNames('relative', className?.content)}
        data-testid="postContainer"
      >
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
          isPostPage={isPostPage}
          isFallback={isFallback}
          customNavigation={customNavigation}
          shouldOnboardAuthor={shouldOnboardAuthor}
          navigationProps={navigationProps}
          engagementProps={engagementActions}
          origin={origin}
          post={post}
        >
          <div className="mb-6 flex flex-col gap-6">
            <CollectionsIntro className="mt-6 laptop:hidden" />
            <div className="flex flex-row items-center pt-6">
              <Link href={`${webappUrl}sources/collections`} passHref>
                <Pill
                  tag="a"
                  label="Collection"
                  className="bg-theme-overlay-float-cabbage text-brand-default"
                />
              </Link>
              <CollectionPostHeaderActions
                post={post}
                onClose={onClose}
                className="ml-auto hidden laptop:flex"
                contextMenuId="post-widgets-context"
              />
            </div>
            <h1
              className="break-words font-bold typo-large-title"
              data-testid="post-modal-title"
            >
              {post.title}
            </h1>
            <PostTagList post={post} />
            {!!updatedAt && (
              <div className="flex items-center text-text-tertiary typo-footnote">
                <span>Last updated</span> <Separator />
                <DateFormat date={updatedAt} type={TimeFormatType.Post} />
              </div>
            )}
            {image && (
              <div className="block h-auto w-full overflow-hidden rounded-12">
                <LazyImage
                  imgSrc={image}
                  imgAlt="Post cover image"
                  ratio="52%"
                  fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                  eager
                  fetchPriority="high"
                />
              </div>
            )}
            <Markdown content={contentHtml} />
          </div>
        </BasePostContent>
      </PostContainer>
      <CollectionPostWidgets
        onCopyPostLink={onCopyPostLink}
        post={post}
        className="pb-8 pt-6"
        onClose={onClose}
        origin={origin}
      />
    </PostContentContainer>
  );
};

export const CollectionPostContent = withPostById(CollectionPostContentRaw);
