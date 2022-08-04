import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { PageWidgets } from '../utilities';
import { ShareMobile } from '../ShareMobile';
import AuthContext from '../../contexts/AuthContext';
import { postAnalyticsEvent } from '../../lib/feed';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import ShareBar from '../ShareBar';
import FurtherReading from '../widgets/FurtherReading';
import { PostUsersHighlights } from '../widgets/PostUsersHighlights';
import { PostModalActions, PostModalActionsProps } from './PostModalActions';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import { ShareProvider } from '../../lib/share';
import { Origin } from '../../lib/analytics';

interface PostWidgetsProps
  extends Omit<PostModalActionsProps, 'contextMenuId'> {
  isNavigationFixed?: boolean;
  origin?: PostOrigin;
}

export function PostWidgets({
  additionalInteractionButtonFeature,
  onShare,
  onBookmark,
  onReadArticle,
  post,
  className,
  isNavigationFixed,
  onClose,
  origin = Origin.ArticlePage,
}: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const sharePost = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: `${post.title}\n${post.commentsPermalink}`,
        });
        trackEvent(
          postAnalyticsEvent('share post', post, {
            extra: { origin, provider: ShareProvider.Native },
          }),
        );
      } catch (err) {
        // Do nothing
      }
    }
  };

  return (
    <PageWidgets
      className={classNames(
        className,
        isNavigationFixed && 'tablet:pt-[5.5rem]',
      )}
    >
      {!isNavigationFixed && (
        <PostModalActions
          additionalInteractionButtonFeature={
            additionalInteractionButtonFeature
          }
          onBookmark={onBookmark}
          onShare={onShare}
          onReadArticle={onReadArticle}
          inlineActions={isNavigationFixed}
          post={post}
          onClose={onClose}
          className="hidden tablet:flex pt-6"
          contextMenuId="post-widgets-context"
        />
      )}
      <PostUsersHighlights post={post} />
      <ShareBar post={post} />
      <ShareMobile share={sharePost} link={post.commentsPermalink} />
      {tokenRefreshed && (
        <FurtherReading currentPost={post} className="laptopL:w-[19.5rem]" />
      )}
    </PageWidgets>
  );
}
