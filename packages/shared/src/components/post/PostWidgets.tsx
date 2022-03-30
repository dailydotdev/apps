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

interface PostWidgetsProps extends PostModalActionsProps {
  isNavigationFixed?: boolean;
}

export function PostWidgets({
  post,
  className,
  isNavigationFixed,
  onClose,
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
            extra: { origin: 'article page' },
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
      <PostModalActions
        inlineActions={isNavigationFixed}
        post={post}
        onClose={onClose}
        className={classNames(
          isNavigationFixed
            ? 'fixed top-[5.5rem] -right-36 tablet:top-[unset] tablet:right-[unset] bg-theme-bg-secondary border-b border-theme-divider-tertiary z-3 -mt-[5.525rem] h-[4.7rem] w-[19.5rem] laptop:w-[23.7rem] -ml-6 py-4 px-8'
            : 'pt-6',
        )}
      />
      <PostUsersHighlights post={post} />
      <ShareBar post={post} />
      <ShareMobile share={sharePost} />
      {tokenRefreshed && (
        <FurtherReading currentPost={post} className="laptopL:w-[19.5rem]" />
      )}
    </PageWidgets>
  );
}
