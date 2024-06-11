import { useCallback, useContext, useMemo } from 'react';
import {
  MutationKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { graphqlUrl } from '../lib/config';
import {
  ADD_BOOKMARKS_MUTATION,
  Post,
  REMOVE_BOOKMARK_MUTATION,
  ReadHistoryPost,
} from '../graphql/posts';
import LogContext from '../contexts/LogContext';
import { useToastNotification } from './useToastNotification';
import { useRequestProtocol } from './useRequestProtocol';
import AuthContext from '../contexts/AuthContext';
import { updatePostCache } from './usePostById';
import { AuthTriggers } from '../lib/auth';
import { LogsEvent, Origin } from '../lib/logs';
import {
  PostLogsEventFnOptions,
  optimisticPostUpdateInFeed,
  postLogsEvent,
} from '../lib/feed';
import { FeedItem, PostItem, UpdateFeedPost } from './useFeed';
import { ActionType } from '../graphql/actions';
import { LazyModal } from '../components/modals/common/types';
import { promotion } from '../components/modals/generic';
import { useLazyModal } from './useLazyModal';
import { useActions } from './useActions';

export type ToggleBookmarkProps = {
  origin: Origin;
  post: Post | ReadHistoryPost;
  opts?: PostLogsEventFnOptions;
};

export const bookmarkMutationKey = ['post', 'mutation', 'bookmark'];

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

const prepareBookmarkPostLogsOptions = ({
  origin,
  opts,
}: ToggleBookmarkProps): PostLogsEventFnOptions => {
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
  const { trackEvent } = useContext(LogContext);
  const { openModal } = useLazyModal();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const seenBookmarkPromotion = useMemo(
    () =>
      isActionsFetched && checkHasCompleted(ActionType.BookmarkPromoteMobile),
    [checkHasCompleted, isActionsFetched],
  );

  const defaultOnMutate = ({ id }) => {
    updatePostCache(client, id, (post) => ({ bookmarked: !post.bookmarked }));

    return () => {
      updatePostCache(client, id, (post) => ({ bookmarked: !post.bookmarked }));
    };
  };

  const { mutateAsync: bookmarkPost } = useMutation(
    ({ mutation, payload }: UseBookmarkPostMutationProps) =>
      requestMethod(graphqlUrl, mutation, {
        ...payload,
      }),
    {
      mutationKey: mutationKey
        ? [...bookmarkMutationKey, ...mutationKey]
        : bookmarkMutationKey,
      onMutate: onMutate || defaultOnMutate,
      onError: (err, _, rollback?: () => void) => rollback?.(),
    },
  );

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

      const logsOptions = prepareBookmarkPostLogsOptions({
        post,
        origin,
        opts,
      });

      if (post.bookmarked) {
        trackEvent(
          postLogsEvent(LogsEvent.RemovePostBookmark, post, logsOptions),
        );
        await removeBookmark({ id: post.id });
        displayToast('Post was removed from your bookmarks');
        return;
      }

      trackEvent(postLogsEvent(LogsEvent.BookmarkPost, post, logsOptions));

      await addBookmark({ id: post.id });
      displayToast('Post was added to your bookmarks');

      if (!seenBookmarkPromotion) {
        completeAction(ActionType.BookmarkPromoteMobile);
        openModal({
          type: LazyModal.MarketingCta,
          props: { marketingCta: promotion.bookmarkPromoteMobile },
        });
      }
    },
    [
      addBookmark,
      completeAction,
      displayToast,
      openModal,
      removeBookmark,
      seenBookmarkPromotion,
      showLogin,
      trackEvent,
      user,
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

  const mutationHandler = (post: Post) => ({ bookmarked: !post.bookmarked });
  const previousState = (items[postIndexToUpdate] as PostItem)?.post
    ?.bookmarked;

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

    const rollbackMutationHandler = () => ({ bookmarked: previousState });

    optimisticPostUpdateInFeed(
      items,
      updatePost,
      rollbackMutationHandler,
    )({ index: postIndexToUpdate });
  };
};
