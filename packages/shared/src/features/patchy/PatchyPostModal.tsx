import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import type { FeedItem } from '../../hooks/useFeed';
import { FeedItemType } from '../../components/cards/common/common';
import { useFeedWidgetPostModal } from '../feedWidgets/useFeedWidgetPostModal';

type Opener = (post: Post) => void;
let opener: Opener | null = null;

// Opens a post Patchy suggested the way the feed does, in the post modal.
// Returns false when nothing is mounted to open it, so the caller navigates.
export const openPatchyPost = (post: Post): boolean => {
  if (!opener) {
    return false;
  }
  opener(post);
  return true;
};

// Mounted once next to the rail. Where the feed would not open a modal (the
// list layout, post types the modal doesn't take) it opens the post page.
export const PatchyPostModal = (): ReactElement | null => {
  const router = useRouter();
  const [request, setRequest] = useState<{ post: Post; at: number } | null>(
    null,
  );
  const items = useMemo<FeedItem[]>(
    () =>
      request
        ? [
            {
              type: FeedItemType.Post,
              post: request.post,
              page: 0,
              index: 0,
              dataUpdatedAt: request.at,
            },
          ]
        : [],
    [request],
  );
  const { openPost, modal } = useFeedWidgetPostModal({
    items,
    feedName: 'patchy',
  });

  useEffect(() => {
    opener = (post) => setRequest({ post, at: Date.now() });
    return () => {
      opener = null;
    };
  }, []);

  useEffect(() => {
    if (request && !openPost(request.post)) {
      router.push(request.post.commentsPermalink);
    }
    // Only a new request opens the post, not a new openPost.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return modal;
};
