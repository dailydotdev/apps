import { useContext } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import request from 'graphql-request';
import { graphqlUrl } from '../lib/config';
import {
  ADD_BOOKMARKS_MUTATION,
  FeedData,
  REMOVE_BOOKMARK_MUTATION,
} from '../graphql/posts';
import AnalyticsContext from '../contexts/AnalyticsContext';
import {
  filterInfiniteCache,
  generateQueryKey,
  MutateFunc,
  RequestKey,
} from '../lib/query';
import { useToastNotification } from './useToastNotification';
import { AnalyticsEvent } from './analytics/useAnalyticsQueue';
import { useAuthContext } from '../contexts/AuthContext';

type UseBookmarkPostParams<T> = {
  onBookmarkMutate: MutateFunc<T>;
  onRemoveBookmarkMutate: MutateFunc<T>;
  onBookmarkTrackObject?: () => AnalyticsEvent;
  onRemoveBookmarkTrackObject?: () => AnalyticsEvent;
};
type UseBookmarkPostRet<T> = {
  bookmark: (variables: T) => Promise<void>;
  bookmarkToast: (targetState: boolean) => void;
  removeBookmark: (variables: T) => Promise<void>;
};

export default function useBookmarkPost<
  T extends { id: string } = { id: string },
>({
  onBookmarkMutate,
  onRemoveBookmarkMutate,
  onBookmarkTrackObject,
  onRemoveBookmarkTrackObject,
}: UseBookmarkPostParams<T>): UseBookmarkPostRet<T> {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { trackEvent } = useContext(AnalyticsContext);
  const { displayToast } = useToastNotification();
  const { mutateAsync: bookmark } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      request(graphqlUrl, ADD_BOOKMARKS_MUTATION, {
        data: { postIds: [id] },
      }),
    {
      onMutate: onBookmarkMutate,
      onError: (err, _, rollback) => rollback?.(),
      onSuccess: () =>
        onBookmarkTrackObject && trackEvent(onBookmarkTrackObject()),
    },
  );

  const { mutateAsync: removeBookmark } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      request(graphqlUrl, REMOVE_BOOKMARK_MUTATION, {
        id,
      }),
    {
      onMutate: onRemoveBookmarkMutate,
      onError: (err, _, rollback) => rollback?.(),
      onSuccess: (_, { id }) => {
        if (onRemoveBookmarkTrackObject)
          trackEvent(onRemoveBookmarkTrackObject());

        filterInfiniteCache<FeedData>(
          {
            client,
            prop: 'page',
            queryKey: generateQueryKey(RequestKey.Bookmarks, user),
          },
          ({ node }) => node.id !== id,
        );
      },
    },
  );
  const bookmarkToast = (targetBookmarState) =>
    targetBookmarState
      ? displayToast('Post was added to your bookmarks')
      : displayToast('Post was removed from your bookmarks');

  return {
    bookmark,
    bookmarkToast,
    removeBookmark,
  };
}
