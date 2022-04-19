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

interface PostWidgetsProps extends PostModalActionsProps {
  isNavigationFixed?: boolean;
  origin?: PostOrigin;
}

export function PostWidgets({
  post,
  className,
  isNavigationFixed,
  onClose,
  origin = 'article page',
}: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const sharePost = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: post.title,
          url: post.commentsPermalink,
        });
        trackEvent(
          postAnalyticsEvent('share post', post, {
            extra: { origin },
          }),
        );
      } catch (err) {
        // Do nothing
      }
    }
  };

  return (
    <PageWidgets
      className={classNames(className, isNavigationFixed && 'pt-[5.5rem]')}
    >
      {!isNavigationFixed && (
        <PostModalActions
          inlineActions={isNavigationFixed}
          post={post}
          onClose={onClose}
          className="hidden tablet:flex pt-6"
          origin={origin}
        />
      )}
      <PostUsersHighlights post={post} />
      <ShareBar post={post} />
      <ShareMobile share={sharePost} />
      {tokenRefreshed && (
        <FurtherReading currentPost={post} className="laptopL:w-[19.5rem]" />
      )}
    </PageWidgets>
  );
}
