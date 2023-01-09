import React, { ReactElement, useContext } from 'react';
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
  origin?: PostOrigin;
}

export function PostWidgets({
  onShare,
  onBookmark,
  onReadArticle,
  post,
  className,
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
    <PageWidgets className={className}>
      <PostModalActions
        onBookmark={onBookmark}
        onShare={onShare}
        onReadArticle={onReadArticle}
        post={post}
        onClose={onClose}
        className="hidden tablet:flex pt-6"
        contextMenuId="post-widgets-context"
      />
      <PostUsersHighlights post={post} />
      <ShareBar post={post} />
      <ShareMobile share={sharePost} link={post.commentsPermalink} />
      {tokenRefreshed && <FurtherReading currentPost={post} />}
    </PageWidgets>
  );
}
