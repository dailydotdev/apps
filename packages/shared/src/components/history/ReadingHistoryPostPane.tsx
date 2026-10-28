import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Post, PostItem } from '../../graphql/posts';
import { Origin } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';
import { updateReadingHistoryPost } from '../../hooks/useReadingHistory';
import { PostPane } from '../post/PostPane';

interface ReadingHistoryPostPaneProps {
  item?: PostItem;
  postId?: string;
  isLoading?: boolean;
  emptyLabel?: string;
  onHide?: () => unknown;
}

export function ReadingHistoryPostPane({
  item,
  postId,
  isLoading,
  emptyLabel,
  onHide,
}: ReadingHistoryPostPaneProps): ReactElement {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // Votes and bookmarks made on the post reach its row.
  const onPostChange = useCallback(
    (post: Post) => {
      const vote = post.userState?.vote;

      updateReadingHistoryPost(queryClient, user, post.id, (current) => ({
        bookmarked: post.bookmarked ?? current.bookmarked,
        numUpvotes: post.numUpvotes ?? current.numUpvotes,
        userState:
          current.userState && vote !== undefined
            ? { ...current.userState, vote }
            : current.userState,
      }));
    },
    [queryClient, user],
  );

  return (
    <PostPane
      postId={postId ?? item?.post.id}
      isLoading={isLoading}
      emptyLabel={emptyLabel}
      fallbackTitle={item?.post.title}
      origin={Origin.History}
      unavailable={{
        description: 'It stays in your history until you remove it.',
        action: onHide
          ? { label: 'Remove from history', onClick: () => onHide() }
          : undefined,
      }}
      onPostChange={onPostChange}
    />
  );
}
