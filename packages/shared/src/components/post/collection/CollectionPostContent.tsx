import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import Link from '../../utilities/Link';
import { ToastSubject, useToastNotification } from '../../../hooks';
import PostContentContainer from '../PostContentContainer';
import usePostContent from '../../../hooks/usePostContent';
import { BasePostContent } from '../BasePostContent';
import { Separator } from '../../cards/common/common';
import { TimeFormatType } from '../../../lib/dateFormat';
import Markdown from '../../Markdown';
import { ParagraphSnapshotButtons } from '../../../features/snapshot/ParagraphSnapshotButtons';
import { SelectionSnapshotBar } from '../../../features/snapshot/SelectionSnapshotBar';
import { CollectionPostWidgets } from './CollectionPostWidgets';
import type { PostContentProps, PostNavigationProps } from '../common';
import { PostContainer, getPostWidgetsClassName } from '../common';
import { Pill } from '../../Pill';
import { CollectionsIntro } from '../widgets';
import { webappUrl } from '../../../lib/constants';
import { useTrackPostView } from '../../../hooks/post/useTrackPostView';
import { DateFormat } from '../../utilities';
import { withPostById } from '../withPostById';
import { PostTagList } from '../tags/PostTagList';
import { CollectionPostHeaderActions } from './CollectionPostHeaderActions';
import { isPostUpdated, type Post } from '../../../graphql/posts';
import { pluralize } from '../../../lib/strings';
import { TRENDS_SOURCE_ID } from '../../../lib/utils';
import {
  CommunitySentiment,
  mapCommunitySentimentPost,
} from '../focus/CommunitySentiment';
import { getCollectionPillLabel, isTrendsPost } from './common';
import { PostImage } from '../PostImage';

type CollectionPostContentRawProps = Omit<PostContentProps, 'post'> & {
  post: Post;
};

export const CollectionPostContentRaw = ({
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
  belowComments,
  shouldTrackView,
}: CollectionPostContentRawProps): ReactElement => {
  const { subject } = useToastNotification();
  const engagementActions = usePostContent({
    origin,
    post,
  });
  const { createdAt, updatedAt, contentHtml, image, numCollectionSources } =
    post;
  const bodyRef = useRef<HTMLDivElement>(null);
  const postContainerRef = useRef<HTMLDivElement>(null);
  const wasUpdated = isPostUpdated(post);
  const dateToShow = wasUpdated ? updatedAt : createdAt;
  const hasSources = !!numCollectionSources && numCollectionSources > 0;
  const sourceId = isTrendsPost(post) ? TRENDS_SOURCE_ID : 'collections';
  const { onCopyPostLink, onReadArticle } = engagementActions;
  const communitySentimentData = post.communitySentiment
    ? mapCommunitySentimentPost(post.communitySentiment)
    : undefined;
  const showCommunitySentiment = !!communitySentimentData;

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

  useTrackPostView({ post, shouldTrack: shouldTrackView });

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
        ref={postContainerRef}
        className={classNames('relative', className?.content)}
        data-testid="postContainer"
      >
        <SelectionSnapshotBar containerRef={postContainerRef} post={post} />
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
          belowComments={belowComments}
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
            <div className="flex flex-row items-center gap-2 pt-6">
              <Link href={`${webappUrl}sources/${sourceId}`} passHref>
                <Pill
                  tag="a"
                  label={getCollectionPillLabel(post)}
                  className="bg-theme-overlay-float-cabbage text-brand-default"
                />
              </Link>
              <CollectionPostHeaderActions
                post={post}
                onClose={onClose}
                hideSubscribeAction={hideSubscribeAction}
                className="ml-auto hidden laptop:flex"
                contextMenuId="post-widgets-context"
              />
            </div>
            <h1
              className="text-balance break-words font-bold typo-large-title"
              data-testid="post-modal-title"
            >
              {post.title}
            </h1>
            <PostTagList post={post} />
            {!!dateToShow && (
              <div className="flex min-w-0 items-center overflow-hidden text-text-tertiary typo-footnote">
                <DateFormat
                  date={dateToShow}
                  type={
                    wasUpdated
                      ? TimeFormatType.PostUpdated
                      : TimeFormatType.Post
                  }
                  prefix={wasUpdated ? 'Last updated ' : undefined}
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
            <PostImage src={image} loading="eager" fetchPriority="high" />
            <div ref={bodyRef}>
              <Markdown content={contentHtml ?? ''} />
              <ParagraphSnapshotButtons containerRef={bodyRef} post={post} />
            </div>
            {showCommunitySentiment && (
              <CommunitySentiment data={communitySentimentData} />
            )}
          </div>
        </BasePostContent>
      </PostContainer>
      <CollectionPostWidgets
        onCopyPostLink={onCopyPostLink}
        post={post}
        className={getPostWidgetsClassName('pb-8 pt-6', !!belowComments)}
        onClose={onClose}
        origin={origin}
      />
    </PostContentContainer>
  );
};

export const CollectionPostContent = withPostById(CollectionPostContentRaw);
