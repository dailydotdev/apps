import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import type { Post } from '../../../graphql/posts';
import { majorHeadlinesQueryOptions } from '../../../graphql/highlights';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureCollectionCardEnhancements } from '../../../lib/featureManagement';

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
  const { value: isCollectionEnhancementsEnabled } = useConditionalFeature({
    feature: featureCollectionCardEnhancements,
  });
  const { updatedAt, createdAt, contentHtml, image, numCollectionSources } =
    post;
  const wasUpdated =
    isCollectionEnhancementsEnabled && !!updatedAt && updatedAt !== createdAt;
  const dateToShow = wasUpdated ? updatedAt : createdAt;
  const hasSources =
    isCollectionEnhancementsEnabled &&
    !!numCollectionSources &&
    numCollectionSources > 0;
  const { onCopyPostLink, onReadArticle } = engagementActions;

  const { data: highlightsData } = useQuery({
    ...majorHeadlinesQueryOptions({}),
    enabled: isCollectionEnhancementsEnabled,
  });
  const highlightForPost = useMemo(() => {
    if (!isCollectionEnhancementsEnabled) {
      return undefined;
    }
    return highlightsData?.majorHeadlines.edges.find(
      (edge) => edge.node.post.id === post.id,
    )?.node;
  }, [highlightsData, post.id, isCollectionEnhancementsEnabled]);

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
            <div className="flex flex-row items-center gap-2 pt-6">
              <Link href={`${webappUrl}sources/collections`} passHref>
                <Pill
                  tag="a"
                  label="Collection"
                  className="bg-theme-overlay-float-cabbage text-brand-default"
                />
              </Link>
              {highlightForPost && (
                <Link
                  href={`${webappUrl}highlights?highlight=${highlightForPost.id}`}
                  passHref
                >
                  <Pill
                    tag="a"
                    label={
                      <span className="feed-highlights-title-gradient">
                        Featured in Happening Now
                      </span>
                    }
                    className="bg-theme-overlay-float-blueCheese"
                  />
                </Link>
              )}
              <CollectionPostHeaderActions
                post={post}
                onClose={onClose}
                hideSubscribeAction={hideSubscribeAction}
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
            {!!dateToShow && (
              <div className="flex min-w-0 items-center overflow-hidden text-text-tertiary typo-footnote">
                <DateFormat
                  date={dateToShow}
                  type={TimeFormatType.Post}
                  prefix={wasUpdated ? 'Last updated ' : undefined}
                />
                {hasSources && (
                  <>
                    <Separator />
                    <span>
                      {numCollectionSources}{' '}
                      {numCollectionSources === 1 ? 'source' : 'sources'}
                    </span>
                  </>
                )}
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
            <Markdown content={contentHtml ?? ''} />
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
