import React, { ReactElement, useContext } from 'react';
import {
  PageWidgets,
  widgetsWidth,
} from '@dailydotdev/shared/src/components/utilities';
import { ShareMobile } from '@dailydotdev/shared/src/components/ShareMobile';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { Post } from '@dailydotdev/shared/src/graphql/posts';
import ShareBar from '@dailydotdev/shared/src/components/ShareBar';
import FurtherReading from '../widgets/FurtherReading';

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
      <ShareBar post={post} />
      <ShareMobile share={sharePost} />
      {tokenRefreshed && (
        <FurtherReading currentPost={post} className={widgetsWidth} />
      )}
    </PageWidgets>
  );
}
