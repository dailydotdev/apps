import type { ReactElement } from 'react';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import type { FeedItem } from '../../hooks/useFeed';
import { FeedItemType } from '../../components/cards/common/common';
import { useFeedWidgetPostModal } from '../feedWidgets/useFeedWidgetPostModal';

export interface PatchyPostRequest {
  post: Post;
  at: number;
}

// Opens each requested post the way the feed does. Where the feed would not
// open a modal (the list layout, post types the modal doesn't take) it opens
// the post page.
const PatchyPostModalHost = ({
  request,
}: {
  request: PatchyPostRequest;
}): ReactElement | null => {
  const router = useRouter();
  const items = useMemo<FeedItem[]>(
    () => [
      {
        type: FeedItemType.Post,
        post: request.post,
        page: 0,
        index: 0,
        dataUpdatedAt: request.at,
      },
    ],
    [request],
  );
  const { openPost, modal } = useFeedWidgetPostModal({
    items,
    feedName: 'patchy',
  });

  useEffect(() => {
    if (!openPost(request.post)) {
      router.push(request.post.commentsPermalink);
    }
    // Only a new request opens the post, not a new openPost.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return modal;
};

export default PatchyPostModalHost;
