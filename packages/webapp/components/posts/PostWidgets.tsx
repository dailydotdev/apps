import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { PageSidebar } from '@dailydotdev/shared/src/components/utilities';
import { ShareMobile } from '@dailydotdev/shared/src/components/ShareMobile';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { PostData } from '@dailydotdev/shared/src/graphql/posts';

const ShareBar = dynamic(
  () => import('@dailydotdev/shared/src/components/ShareBar'),
  {
    ssr: false,
  },
);

const FurtherReading = dynamic(
  () =>
    import(
      /* webpackChunkName: "furtherReading" */ '../widgets/FurtherReading'
    ),
);

interface PostWidgetsProps {
  postById: PostData;
}

export function PostWidgets({ postById }: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const sharePost = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: postById.post.title,
          url: postById.post.commentsPermalink,
        });
        trackEvent(
          postAnalyticsEvent('share post', postById.post, {
            extra: { origin: 'article page' },
          }),
        );
      } catch (err) {
        // Do nothing
      }
    }
  };

  return (
    <PageSidebar>
      {postById && <ShareBar post={postById.post} />}
      <ShareMobile share={sharePost} />
      {postById?.post && tokenRefreshed && (
        <FurtherReading
          currentPost={postById.post}
          className="laptopL:w-[19.5rem]"
        />
      )}
    </PageSidebar>
  );
}
