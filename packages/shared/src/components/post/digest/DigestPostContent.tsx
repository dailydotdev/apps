import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useMemo, useEffect } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import SettingsContext, {
  useSettingsContext,
} from '../../../contexts/SettingsContext';
import { useViewPost } from '../../../hooks/post/useViewPost';
import { withPostById } from '../withPostById';
import PostContentContainer from '../PostContentContainer';
import { BasePostContent } from '../BasePostContent';
import type { PostContentProps, PostNavigationProps } from '../common';
import { PostContainer } from '../common';
import { ToastSubject, useToastNotification } from '../../../hooks';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { AnalyticsIcon } from '../../icons';
import { CollectionPillSources } from '../collection';
import { ProfileImageSize } from '../../ProfilePicture';
import { BriefPostHeaderActions } from '../brief/BriefPostHeaderActions';
import type { BriefPostHeaderProps } from '../../../features/briefing/components/BriefPostHeader';
import { BriefPostHeader } from '../../../features/briefing/components/BriefPostHeader';
import type { FeedProps } from '../../Feed';
import Feed from '../../Feed';
import {
  FEED_BY_IDS_QUERY,
  supportedTypesForPrivateSources,
} from '../../../graphql/feed';
import {
  generateQueryKey,
  OtherFeedPage,
  RequestKey,
} from '../../../lib/query';
import { formatDate, TimeFormatType } from '../../../lib/dateFormat';
import { transformDigestAd } from './utils';

const DigestPostContentRaw = ({
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
  const settingsContext = useSettingsContext();
  // ensure digest feed renders list mode
  const digestSettings = useMemo(
    () => ({ ...settingsContext, insaneMode: true }),
    [settingsContext],
  );
  const postsCount = post?.flags?.posts || 0;
  const sourcesCount = post?.flags?.sources || 0;
  const digestPostIds = post?.flags?.digestPostIds;

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const containerClass = classNames(
    '!max-w-3xl laptop:flex-row laptop:pb-0',
    className?.container,
  );

  const navigationProps: PostNavigationProps = {
    postPosition,
    onPreviousPost,
    onNextPost,
    post,
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

  const feedQueryKey = generateQueryKey(RequestKey.FeedByIds, user, post?.id);

  const digestAd = post?.flags?.ad;
  const staticAd = useMemo(
    () => (digestAd ? transformDigestAd(digestAd) : undefined),
    [digestAd],
  );

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    return {
      feedName: OtherFeedPage.FeedByIds,
      feedQueryKey,
      query: FEED_BY_IDS_QUERY,
      variables: {
        supportedTypes: supportedTypesForPrivateSources,
        postIds: digestPostIds,
      },
      disableAds: true,
      staticAd,
      disableAdRefresh: true,
      options: { refetchOnMount: true },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, digestPostIds, post?.id, staticAd]);

  const formattedDate = post?.createdAt
    ? formatDate({
        value: post.createdAt,
        type: TimeFormatType.Post,
      })
    : '';

  const headerProps: BriefPostHeaderProps = useMemo(
    () => ({
      kicker: formattedDate,
      heading: 'Your personalized digest',
      stats: [
        ...(postsCount
          ? [
              {
                Icon: AnalyticsIcon,
                label: `${postsCount} posts`,
              },
            ]
          : []),
        ...(sourcesCount
          ? [
              {
                Icon: AnalyticsIcon,
                label: `${sourcesCount} sources`,
              },
            ]
          : []),
      ],
    }),
    [formattedDate, postsCount, sourcesCount],
  );

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
          origin={origin}
          post={post}
        >
          <div className="my-6 flex flex-col gap-2">
            <BriefPostHeader {...headerProps}>
              <BriefPostHeaderActions
                post={post}
                onClose={onClose}
                origin={origin}
                contextMenuId="post-widgets-context"
              />
            </BriefPostHeader>
            <div className="flex flex-wrap items-center gap-3">
              {post.collectionSources?.length > 0 && (
                <div className="flex w-full items-center gap-1">
                  <CollectionPillSources
                    alwaysShowSources
                    sources={post.collectionSources}
                    totalSources={post.collectionSources.length}
                    size={ProfileImageSize.Size16}
                    limit={6}
                  />
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                    truncate
                  >
                    {sourcesCount ?? 0} Sources
                  </Typography>
                </div>
              )}
            </div>
            {!!digestPostIds?.length && (
              <SettingsContext.Provider value={digestSettings}>
                <Feed {...feedProps} />
              </SettingsContext.Provider>
            )}
          </div>
        </BasePostContent>
      </PostContainer>
    </PostContentContainer>
  );
};

export const DigestPostContent = withPostById(DigestPostContentRaw);
