import { useCallback, useContext } from 'react';
import type {
  InfiniteData,
  MutationKey,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Ad, Post, ReadHistoryPost } from '../graphql/posts';
import {
  ADD_BOOKMARKS_MUTATION,
  REMOVE_BOOKMARK_MUTATION,
} from '../graphql/posts';
import LogContext from '../contexts/LogContext';
import { useToastNotification } from './useToastNotification';
import { useRequestProtocol } from './useRequestProtocol';
import AuthContext from '../contexts/AuthContext';
import {
  updatePostCache,
  RequestKey,
  updateAdPostInCache,
  createAdPostRollbackHandler,
} from '../lib/query';
import { AuthTriggers } from '../lib/auth';
import type { Origin } from '../lib/log';
import { LogEvent } from '../lib/log';
import type { PostLogEventFnOptions } from '../lib/feed';
import { optimisticPostUpdateInFeed, usePostLogEvent } from '../lib/feed';
import type { AdItem, FeedItem, PostItem, UpdateFeedPost } from './useFeed';
import { ActionType } from '../graphql/actions';
import { useActions } from './useActions';
import { bookmarkMutationKey } from './bookmark/types';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import type { Bookmark } from '../graphql/bookmarks';
import { useActiveFeedContext } from '../contexts';

export type ToggleBookmarkProps = {
  origin: Origin;
  post: Post | ReadHistoryPost;
  opts?: PostLogEventFnOptions;
  disableToast?: boolean;
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
  const postLogEvent = usePostLogEvent();
  const { logOpts } = useActiveFeedContext();

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
    async ({ post, origin, opts, disableToast }: ToggleBookmarkProps) => {
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

      // Merge ActiveFeedContext.logOpts if available (modal context)
      const finalLogOptions = logOpts
        ? { ...logOptions, ...logOpts }
        : logOptions;

      if (post.bookmarked) {
        logEvent(
          postLogEvent(LogEvent.RemovePostBookmark, post, finalLogOptions),
        );
        if (disableToast) {
          return;
        }
        await removeBookmark({ id: post.id });
        displayToast('Post was removed from your bookmarks');
        return;
      }

      logEvent(postLogEvent(LogEvent.BookmarkPost, post, finalLogOptions));

      const result = await addBookmark({ id: post.id });
      const list = result?.addBookmarks?.[0]?.list ?? null;

      if (disableToast) {
        return;
      }
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
                  postLogEvent(
                    LogEvent.MoveBookmarkToFolder,
                    post,
                    finalLogOptions,
                  ),
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
      postLogEvent,
      logOpts,
    ],
  );

  return { toggleBookmark };
};

export { useBookmarkPost };

type MutateBookmarkFeedPostProps = {
  id: string;
  updatePost: UpdateFeedPost;
  items: FeedItem[];
  queryClient?: QueryClient;
  feedQueryKey?: QueryKey;
};

export const mutateBookmarkFeedPost = ({
  id,
  items,
  updatePost,
  queryClient,
  feedQueryKey,
}: MutateBookmarkFeedPostProps): ReturnType<
  UseBookmarkPostProps['onMutate']
> => {
  if (!items) {
    return undefined;
  }

  const postIndexToUpdate = items.findIndex(
    (item) => item.type === 'post' && item.post.id === id,
  );

  const adIndexToUpdate = items.findIndex(
    (item) => item.type === 'ad' && item.ad.data?.post?.id === id,
  );

  if (postIndexToUpdate === -1 && adIndexToUpdate === -1) {
    return undefined;
  }

  const mutationHandler = (post: Post) => {
    const isBookmarked = !post?.bookmarked;

    return {
      bookmarked: isBookmarked,
      bookmark: !isBookmarked ? undefined : post?.bookmark,
    };
  };

  let previousBookmark: Bookmark;
  let previousState: boolean | undefined;
  const rollbackFunctions: (() => void)[] = [];

  // Handle regular post update
  if (postIndexToUpdate !== -1) {
    const postItem = (items[postIndexToUpdate] as PostItem)?.post;
    previousBookmark = postItem?.bookmark;
    previousState = postItem?.bookmarked;

    optimisticPostUpdateInFeed(
      items,
      updatePost,
      mutationHandler,
    )({ index: postIndexToUpdate });

    rollbackFunctions.push(() => {
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
    });
  }

  // Handle Post Ad update
  if (adIndexToUpdate !== -1 && queryClient && feedQueryKey) {
    const adItem = items[adIndexToUpdate] as AdItem;
    const adPost = adItem.ad.data?.post;

    if (adPost) {
      previousBookmark = adPost.bookmark;
      previousState = adPost.bookmarked;

      // Update the ad's post in the ads cache
      const adsQueryKey = [RequestKey.Ads, ...feedQueryKey];

      queryClient.setQueryData(adsQueryKey, (currentData: InfiniteData<Ad>) => {
        if (!currentData || !currentData.pages?.length) {
          return currentData;
        }

        const existingAdPost = currentData.pages.find(
          (page) => page.data?.post?.id === id,
        )?.data?.post;
        return updateAdPostInCache(
          id,
          currentData,
          mutationHandler(existingAdPost),
        );
      });

      rollbackFunctions.push(() => {
        queryClient.setQueryData(
          adsQueryKey,
          createAdPostRollbackHandler(id, {
            bookmarked: previousState,
            bookmark: previousBookmark,
          }),
        );
      });
    }
  }

  return () => {
    rollbackFunctions.forEach((rollback) => rollback());
  };
};
