import { useCallback, useContext } from 'react';
import type { MutationKey } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Post, ReadHistoryPost } from '../graphql/posts';
import {
  ADD_BOOKMARKS_MUTATION,
  REMOVE_BOOKMARK_MUTATION,
} from '../graphql/posts';
import LogContext from '../contexts/LogContext';
import { useToastNotification } from './useToastNotification';
import { useRequestProtocol } from './useRequestProtocol';
import AuthContext from '../contexts/AuthContext';
import { updatePostCache } from '../lib/query';
import { AuthTriggers } from '../lib/auth';
import type { Origin } from '../lib/log';
import { LogEvent } from '../lib/log';
import type { PostLogEventFnOptions } from '../lib/feed';
import { optimisticPostUpdateInFeed, postLogEvent } from '../lib/feed';
import type { FeedItem, PostItem, UpdateFeedPost } from './useFeed';
import { ActionType } from '../graphql/actions';
import { useActions } from './useActions';
import { bookmarkMutationKey } from './bookmark/types';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

export type ToggleBookmarkProps = {
  origin: Origin;
  post: Post | ReadHistoryPost;
  opts?: PostLogEventFnOptions;
};

export type UseBookmarkPostMutationProps = {
  id?: string;
  mutation?: string;
  payload?: Record<string, unknown>;
};

export type UseBookmarkPostRollback = () => void;

export type BookmarkProps = {
  id: string;
};

export type UseBookmarkPostProps = {
  onMutate?: (
    props: UseBookmarkPostMutationProps,
  ) => Promise<UseBookmarkPostRollback> | UseBookmarkPostRollback | undefined;
  mutationKey?: MutationKey;
};

const prepareBookmarkPostLogOptions = ({
  origin,
  opts,
}: ToggleBookmarkProps): PostLogEventFnOptions => {
  const { extra, ...restOpts } = opts || {};

  return {
    ...restOpts,
    extra: { ...extra, origin },
  };
};

export type UseBookmarkPost = {
  toggleBookmark: (props: ToggleBookmarkProps) => Promise<void>;
};

const useBookmarkPost = ({
  onMutate,
  mutationKey,
}: UseBookmarkPostProps = {}): UseBookmarkPost => {
  const { requestMethod } = useRequestProtocol();
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, showLogin } = useContext(AuthContext);
  const { logEvent } = useContext(LogContext);
  const { completeAction } = useActions();
  const { openModal } = useLazyModal();

  const defaultOnMutate = ({ id }) => {
    updatePostCache(client, id, (post) => ({ bookmarked: !post.bookmarked }));

    return () => {
      updatePostCache(client, id, (post) => ({ bookmarked: !post.bookmarked }));
    };
  };

  const { mutateAsync: bookmarkPost } = useMutation({
    mutationKey: mutationKey
      ? [...bookmarkMutationKey, ...mutationKey]
      : bookmarkMutationKey,
    mutationFn: ({ mutation, payload }: UseBookmarkPostMutationProps) =>
      requestMethod(mutation, {
        ...payload,
      }),
    onMutate: onMutate || defaultOnMutate,
    onSuccess: () => {
      completeAction(ActionType.BookmarkPost);
    },
    onError: (err, _, rollback?: () => void) => rollback?.(),
  });

  const addBookmark = useCallback(
    ({ id }: BookmarkProps) => {
      return bookmarkPost({
        id,
        mutation: ADD_BOOKMARKS_MUTATION,
        payload: { data: { postIds: [id] } },
      });
    },
    [bookmarkPost],
  );

  const removeBookmark = useCallback(
    ({ id }: BookmarkProps) => {
      return bookmarkPost({
        id,
        mutation: REMOVE_BOOKMARK_MUTATION,
        payload: { id },
      });
    },
    [bookmarkPost],
  );

  const toggleBookmark = useCallback(
    async ({ post, origin, opts }: ToggleBookmarkProps) => {
      if (!post) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Bookmark });
        return;
      }

      const logOptions = prepareBookmarkPostLogOptions({
        post,
        origin,
        opts,
      });

      if (post.bookmarked) {
        logEvent(postLogEvent(LogEvent.RemovePostBookmark, post, logOptions));
        await removeBookmark({ id: post.id });
        displayToast('Post was removed from your bookmarks');
        return;
      }

      logEvent(postLogEvent(LogEvent.BookmarkPost, post, logOptions));

      const result = await addBookmark({ id: post.id });
      const list = result?.addBookmarks?.[0]?.list ?? null;

      displayToast(`Bookmarked! Saved to ${list?.name ?? 'Quick saves'}`, {
        undoCopy: 'Change folder',
        onUndo: () => {
          openModal({
            type: LazyModal.MoveBookmark,
            props: {
              postId: post.id,
              listId: list?.id,
              onMoveBookmark: async () => {
                logEvent(
                  postLogEvent(LogEvent.MoveBookmarkToFolder, post, logOptions),
                );
              },
            },
          });
        },
      });
    },
    [
      user,
      logEvent,
      addBookmark,
      showLogin,
      removeBookmark,
      displayToast,
      openModal,
    ],
  );

  return { toggleBookmark };
};

export { useBookmarkPost };

type MutateBookmarkFeedPostProps = {
  id: string;
  updatePost: UpdateFeedPost;
  items: FeedItem[];
};

export const mutateBookmarkFeedPost = ({
  id,
  items,
  updatePost,
}: MutateBookmarkFeedPostProps): ReturnType<
  UseBookmarkPostProps['onMutate']
> => {
  if (!items) {
    return undefined;
  }

  const postIndexToUpdate = items.findIndex(
    (item) => item.type === 'post' && item.post.id === id,
  );

  if (postIndexToUpdate === -1) {
    return undefined;
  }

  const mutationHandler = (post: Post) => {
    const isBookmarked = !post?.bookmarked;

    return {
      bookmarked: isBookmarked,
      bookmark: !isBookmarked ? undefined : post?.bookmark,
    };
  };

  const postItem = (items[postIndexToUpdate] as PostItem)?.post;
  const previousBookmark = postItem?.bookmark;
  const previousState = postItem?.bookmarked;

  optimisticPostUpdateInFeed(
    items,
    updatePost,
    mutationHandler,
  )({ index: postIndexToUpdate });

  return () => {
    const postIndexToRollback = items.findIndex(
      (item) => item.type === 'post' && item.post.id === id,
    );

    if (postIndexToRollback === -1) {
      return;
    }

    const rollbackMutationHandler = () => ({
      bookmarked: previousState,
      bookmark: previousBookmark,
    });

    optimisticPostUpdateInFeed(
      items,
      updatePost,
      rollbackMutationHandler,
    )({ index: postIndexToUpdate });
  };
};
