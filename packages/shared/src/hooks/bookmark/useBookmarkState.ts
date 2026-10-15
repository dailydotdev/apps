import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Bookmark } from '../../graphql/bookmarks';
import {
  setBookmarkArchived,
  setBookmarkNote,
  setBookmarkReadState,
} from '../../graphql/bookmarks';
import { BookmarkStatus } from '../../graphql/feed';
import type { Post } from '../../graphql/posts';
import { useActiveFeedContext } from '../../contexts';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { optimisticPostUpdateInFeed, usePostLogEvent } from '../../lib/feed';
import {
  RequestKey,
  updateCachedPagePost,
  updatePostCache,
} from '../../lib/query';
import { useToastNotification } from '../useToastNotification';

interface UseBookmarkState {
  onToggleRead: (post: Post, read: boolean) => Promise<void>;
  onToggleArchived: (post: Post, archived: boolean) => Promise<void>;
  onSetNote: (post: Post, note: string | null) => Promise<void>;
}

const bookmarksFeedStatus = (
  queryKey?: readonly unknown[],
): BookmarkStatus | undefined => {
  if (queryKey?.[0] !== RequestKey.Bookmarks) {
    return undefined;
  }

  const params = queryKey[2] as { status?: BookmarkStatus } | undefined;

  return params?.status ?? BookmarkStatus.All;
};

/**
 * Read, archive and note changes on a bookmark. Each one patches the post in
 * every cache it lives in, and drops the card from the bookmarks feed when it
 * no longer belongs to the status the feed is showing.
 */
export const useBookmarkState = (): UseBookmarkState => {
  const client = useQueryClient();
  const {
    queryKey: feedQueryKey,
    items,
    onRemovePost,
    logOpts,
  } = useActiveFeedContext();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();

  const patchBookmark = useCallback(
    (postId: string, patch: Partial<Bookmark>) => {
      const merge = (post: Post): Partial<Post> => ({
        bookmarked: true,
        bookmark: {
          ...(post.bookmark ?? { createdAt: new Date() }),
          ...patch,
        },
      });

      updatePostCache(client, postId, merge);

      if (!feedQueryKey) {
        return;
      }

      const index = items.findIndex(
        (item) => item.type === 'post' && item.post.id === postId,
      );

      if (index === -1) {
        return;
      }

      const update = optimisticPostUpdateInFeed(
        items,
        updateCachedPagePost(feedQueryKey, client),
        merge,
      );
      update({ index });
    },
    [client, feedQueryKey, items],
  );

  const removeFromFeed = useCallback(
    (postId: string) => {
      const index = items.findIndex(
        (item) => item.type === 'post' && item.post.id === postId,
      );

      if (index !== -1) {
        onRemovePost?.(index);
      }
    },
    [items, onRemovePost],
  );

  const invalidateFacets = useCallback(
    () => client.invalidateQueries({ queryKey: [RequestKey.BookmarkFacets] }),
    [client],
  );

  const refetchFeed = useCallback(() => {
    if (feedQueryKey) {
      client.invalidateQueries({ queryKey: feedQueryKey });
    }
  }, [client, feedQueryKey]);

  const { mutateAsync: mutateRead } = useMutation({
    mutationFn: setBookmarkReadState,
    onSuccess: (_, { postId, read }) => {
      patchBookmark(
        postId,
        read
          ? { read: true, readAt: new Date() }
          : { read: false, readAt: null, unreadAt: new Date() },
      );
      invalidateFacets();
    },
    onError: () => displayToast('Failed to update the bookmark'),
  });

  const { mutateAsync: mutateArchived } = useMutation({
    mutationFn: setBookmarkArchived,
    onSuccess: (_, { postId, archived }) => {
      patchBookmark(
        postId,
        archived
          ? { archivedAt: new Date(), read: true }
          : { archivedAt: null },
      );
      invalidateFacets();
    },
    onError: () => displayToast('Failed to update the bookmark'),
  });

  const { mutateAsync: mutateNote } = useMutation({
    mutationFn: setBookmarkNote,
    onSuccess: (_, { postId, note }) => {
      patchBookmark(postId, { note: note || null });
    },
    onError: () => displayToast('Failed to save the note'),
  });

  const onToggleRead = useCallback(
    async (post: Post, read: boolean) => {
      logEvent(
        postLogEvent(
          read ? LogEvent.MarkBookmarkRead : LogEvent.MarkBookmarkUnread,
          post,
          logOpts,
        ),
      );
      await mutateRead({ postId: post.id, read });

      const status = bookmarksFeedStatus(feedQueryKey);
      const leavesFeed =
        (status === BookmarkStatus.Unread && read) ||
        (status === BookmarkStatus.Read && !read);

      if (leavesFeed) {
        removeFromFeed(post.id);
      }

      displayToast(read ? 'Marked as read' : 'Marked as unread', {
        action: {
          copy: 'Undo',
          onClick: async () => {
            await mutateRead({ postId: post.id, read: !read });
            if (leavesFeed) {
              refetchFeed();
            }
          },
        },
      });
    },
    [
      displayToast,
      feedQueryKey,
      logEvent,
      logOpts,
      mutateRead,
      postLogEvent,
      refetchFeed,
      removeFromFeed,
    ],
  );

  const onToggleArchived = useCallback(
    async (post: Post, archived: boolean) => {
      logEvent(
        postLogEvent(
          archived ? LogEvent.ArchiveBookmark : LogEvent.UnarchiveBookmark,
          post,
          logOpts,
        ),
      );
      await mutateArchived({ postId: post.id, archived });

      const status = bookmarksFeedStatus(feedQueryKey);
      const leavesFeed =
        !!status && (status === BookmarkStatus.Archived) !== archived;

      if (leavesFeed) {
        removeFromFeed(post.id);
      }

      displayToast(archived ? 'Bookmark archived' : 'Bookmark restored', {
        action: {
          copy: 'Undo',
          onClick: async () => {
            await mutateArchived({ postId: post.id, archived: !archived });
            if (leavesFeed) {
              refetchFeed();
            }
          },
        },
      });
    },
    [
      displayToast,
      feedQueryKey,
      logEvent,
      logOpts,
      mutateArchived,
      postLogEvent,
      refetchFeed,
      removeFromFeed,
    ],
  );

  const onSetNote = useCallback(
    async (post: Post, note: string | null) => {
      logEvent(
        postLogEvent(LogEvent.SetBookmarkNote, post, {
          ...logOpts,
          extra: { has_note: !!note },
        }),
      );
      await mutateNote({ postId: post.id, note });
      displayToast(note ? 'Note saved' : 'Note removed');
    },
    [displayToast, logEvent, logOpts, mutateNote, postLogEvent],
  );

  return { onToggleRead, onToggleArchived, onSetNote };
};
