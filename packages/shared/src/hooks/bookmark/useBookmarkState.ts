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
import { usePostLogEvent } from '../../lib/feed';
import { RequestKey } from '../../lib/query';
import { useToastNotification } from '../useToastNotification';
import { patchBookmarkInCaches } from './patchBookmarkInCaches';

interface UseBookmarkState {
  // Each resolves to whether the change went through; failures already toast
  onToggleRead: (post: Post, read: boolean) => Promise<boolean>;
  onToggleArchived: (post: Post, archived: boolean) => Promise<boolean>;
  onSetNote: (post: Post, note: string | null) => Promise<boolean>;
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
    (postId: string, patch: Partial<Bookmark>) =>
      patchBookmarkInCaches({
        client,
        postId,
        feedQueryKey,
        items,
        mutate: (post) => ({
          bookmarked: true,
          bookmark: {
            ...(post.bookmark ?? { createdAt: new Date() }),
            ...patch,
          },
        }),
      }),
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
      patchBookmark(postId, { read });
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

      try {
        await mutateRead({ postId: post.id, read });
      } catch {
        return false;
      }

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
            logEvent(
              postLogEvent(
                read ? LogEvent.MarkBookmarkUnread : LogEvent.MarkBookmarkRead,
                post,
                { ...logOpts, extra: { undo: true } },
              ),
            );
            await mutateRead({ postId: post.id, read: !read }).catch(
              () => undefined,
            );
            if (leavesFeed) {
              refetchFeed();
            }
          },
        },
      });

      return true;
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
      // Archiving marks the bookmark read, so an undo has to bring that back
      const wasRead = !!post.bookmark?.read;
      logEvent(
        postLogEvent(
          archived ? LogEvent.ArchiveBookmark : LogEvent.UnarchiveBookmark,
          post,
          logOpts,
        ),
      );

      try {
        await mutateArchived({ postId: post.id, archived });
      } catch {
        return false;
      }

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
            logEvent(
              postLogEvent(
                archived
                  ? LogEvent.UnarchiveBookmark
                  : LogEvent.ArchiveBookmark,
                post,
                { ...logOpts, extra: { undo: true } },
              ),
            );
            await mutateArchived({
              postId: post.id,
              archived: !archived,
            }).catch(() => undefined);
            if (archived && !wasRead) {
              await mutateRead({ postId: post.id, read: false }).catch(
                () => undefined,
              );
            }
            if (leavesFeed) {
              refetchFeed();
            }
          },
        },
      });

      return true;
    },
    [
      displayToast,
      feedQueryKey,
      logEvent,
      logOpts,
      mutateArchived,
      mutateRead,
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

      try {
        await mutateNote({ postId: post.id, note });
      } catch {
        return false;
      }

      displayToast(note ? 'Note saved' : 'Note removed');

      return true;
    },
    [displayToast, logEvent, logOpts, mutateNote, postLogEvent],
  );

  return { onToggleRead, onToggleArchived, onSetNote };
};
