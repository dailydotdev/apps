import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { ToastSubject, useToastNotification } from '../../../hooks';
import PostContentContainer from '../PostContentContainer';
import usePostContent from '../../../hooks/usePostContent';
import { BasePostContent } from '../BasePostContent';
import { Separator } from '../../cards/common/common';
import { TimeFormatType } from '../../../lib/dateFormat';
import Markdown from '../../Markdown';
import type { PostContentProps, PostNavigationProps } from '../common';
import { PostContainer } from '../common';
import { Pill } from '../../Pill';
import { CollectionsIntro } from '../widgets';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useViewPost } from '../../../hooks/post/useViewPost';
import { DateFormat } from '../../utilities';
import { withPostById } from '../withPostById';
import { PostTagList } from '../tags/PostTagList';
import { CollectionPostHeaderActions } from './CollectionPostHeaderActions';
import { isPostUpdated, type Post } from '../../../graphql/posts';
import { pluralize } from '../../../lib/strings';
import { PostExperienceLayout } from '../experience/PostExperienceLayout';
import { PostHero } from '../experience/PostHero';
import { PostContextRail } from '../experience/PostContextRail';
import { PersonalizedFeedPreview } from '../experience/PersonalizedFeedPreview';

type CollectionPostContentRawProps = Omit<PostContentProps, 'post'> & {
  post: Post;
};

const CollectionPostContentRaw = ({
  post,
  className = {},
  shouldOnboardAuthor,
  origin,
  position,
  inlineActions,
  hideSubscribeAction,
  onPreviousPost,
  onNextPost,
  onClose,
  postPosition,
  isFallback,
  customNavigation,
  backToSquad,
  isBannerVisible,
  isPostPage,
}: CollectionPostContentRawProps): ReactElement => {
  const { user } = useAuthContext();
  const { subject } = useToastNotification();
  const engagementActions = usePostContent({
    origin,
    post,
  });
  const { createdAt, updatedAt, contentHtml, numCollectionSources } = post;
  const wasUpdated = isPostUpdated(post);
  const dateToShow = wasUpdated ? updatedAt : createdAt;
  const hasSources = !!numCollectionSources && numCollectionSources > 0;
  const { onCopyPostLink, onReadArticle } = engagementActions;

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const containerClass = classNames(
    'px-2 py-3 tablet:px-4 laptop:flex-row laptop:pb-6',
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
              className: {
                ...className?.fixedNavigation,
                container: classNames(
                  className?.fixedNavigation?.container,
                  isPostPage && 'tablet:max-w-[calc(100%-4rem)]',
                ),
              },
            }
          : undefined
      }
    >
      <PostContainer
        className={classNames(
          'relative overflow-visible !px-0 laptop:!border-r-0',
          className?.content,
        )}
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
          <PostExperienceLayout
            hero={
              <PostHero
                hideSubscribeAction={hideSubscribeAction}
                inlineActions={inlineActions}
                onClose={onClose}
                onReadArticle={onReadArticle}
                post={post}
                title={post.title ?? 'Collection'}
              />
            }
            rail={
              <PostContextRail
                onCopyPostLink={onCopyPostLink}
                origin={origin}
                post={post}
              />
            }
          >
            <section className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-4 tablet:p-6">
              <div className="mb-5 flex flex-row items-center gap-2">
                <Pill
                  label="Collection"
                  className="bg-theme-overlay-float-cabbage text-brand-default"
                />
                <CollectionPostHeaderActions
                  className="ml-auto hidden laptop:flex"
                  contextMenuId="post-widgets-context"
                  hideSubscribeAction={hideSubscribeAction}
                  onClose={onClose}
                  post={post}
                />
              </div>
              <CollectionsIntro className="mb-5 laptop:hidden" />
              <PostTagList post={post} />
              {!!dateToShow && (
                <div className="mt-4 flex min-w-0 items-center overflow-hidden text-text-tertiary typo-footnote">
                  <DateFormat
                    date={dateToShow}
                    prefix={wasUpdated ? 'Last updated ' : undefined}
                    type={
                      wasUpdated
                        ? TimeFormatType.PostUpdated
                        : TimeFormatType.Post
                    }
                  />
                  {hasSources && (
                    <>
                      <Separator />
                      <span>
                        {numCollectionSources}{' '}
                        {pluralize('source', numCollectionSources)}
                      </span>
                    </>
                  )}
                </div>
              )}
              <div className="mt-6">
                <Markdown content={contentHtml ?? ''} />
              </div>
            </section>
            <PersonalizedFeedPreview post={post} />
          </PostExperienceLayout>
        </BasePostContent>
      </PostContainer>
    </PostContentContainer>
  );
};

export const CollectionPostContent = withPostById(CollectionPostContentRaw);
