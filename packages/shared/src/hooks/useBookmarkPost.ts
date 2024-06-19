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
import { LogEvent, Origin } from '../lib/log';
import {
  PostLogEventFnOptions,
  optimisticPostUpdateInFeed,
  postLogEvent,
} from '../lib/feed';
import { FeedItem, PostItem, UpdateFeedPost } from './useFeed';
import { ActionType } from '../graphql/actions';
import { LazyModal } from '../components/modals/common/types';
import { promotion } from '../components/modals/generic';
import { useLazyModal } from './useLazyModal';
import { useActions } from './useActions';
import { useJustBookmarkedContext } from '../contexts';

export type ToggleBookmarkProps = {
  origin: Origin;
  post: Post | ReadHistoryPost;
  opts?: PostLogEventFnOptions;
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
  const { openModal } = useLazyModal();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const seenBookmarkPromotion = useMemo(
    () =>
      isActionsFetched && checkHasCompleted(ActionType.BookmarkPromoteMobile),
    [checkHasCompleted, isActionsFetched],
  );
  const { addPostToJustBookmarked } = useJustBookmarkedContext();

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
      onSuccess: () => {
        completeAction(ActionType.BookmarkPost);
      },
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

      await addBookmark({ id: post.id });
      addPostToJustBookmarked(post.id);

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
      logEvent,
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
