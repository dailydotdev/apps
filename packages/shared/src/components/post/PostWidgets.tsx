import React, { ReactElement, useContext } from 'react';
import { PageWidgets } from '../utilities';
import { ShareMobile } from '../ShareMobile';
import AuthContext from '../../contexts/AuthContext';
import { postAnalyticsEvent } from '../../lib/feed';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Post } from '../../graphql/posts';
import ShareBar from '../ShareBar';
import FurtherReading from '../widgets/FurtherReading';
import { PostUsersHighlights } from '../widgets/PostUsersHighlights';

interface PostWidgetsProps {
  post: Post;
}

export function PostWidgets({ post }: PostWidgetsProps): ReactElement {
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
    <PageWidgets>
      <PostUsersHighlights post={post} />
      <ShareBar post={post} />
      <ShareMobile share={sharePost} />
      {tokenRefreshed && (
        <FurtherReading currentPost={post} className="laptopL:w-[19.5rem]" />
      )}
    </PageWidgets>
  );
}
