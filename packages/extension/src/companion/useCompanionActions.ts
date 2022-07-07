import { useMemo } from 'react';
import { useMutation } from 'react-query';
import { browser } from 'webextension-polyfill-ts';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  ADD_BOOKMARKS_MUTATION,
  CANCEL_UPVOTE_MUTATION,
  REMOVE_BOOKMARK_MUTATION,
  REPORT_POST_MUTATION,
  UPVOTE_MUTATION,
} from '@dailydotdev/shared/src/graphql/posts';
import { ADD_FILTERS_TO_FEED_MUTATION } from '@dailydotdev/shared/src/graphql/feedSettings';
import { UPDATE_ALERTS } from '@dailydotdev/shared/src/graphql/alerts';
import { UPDATE_USER_SETTINGS_MUTATION } from '@dailydotdev/shared/src/graphql/settings';
import { MutateFunc } from '@dailydotdev/shared/src/lib/query';
import { companionRequest } from './companionRequest';

type UseCompanionActionsParams<T> = {
  onBookmarkMutate: MutateFunc<T>;
  onRemoveBookmarkMutate: MutateFunc<T>;
  onUpvoteMutate: MutateFunc<T>;
  onRemoveUpvoteMutate: MutateFunc<T>;
};
type UseCompanionActionsRet<T> = {
  report: (variables: T) => Promise<void>;
  blockSource: (variables: T) => Promise<void>;
  bookmark: (variables: T) => Promise<void>;
  removeBookmark: (variables: T) => Promise<void>;
  upvote: (variables: T) => Promise<void>;
  removeUpvote: (variables: T) => Promise<void>;
  disableCompanion: (variables: T) => Promise<void>;
  removeCompanionHelper: (variables: T) => Promise<void>;
  toggleCompanionExpanded: (variables: T) => Promise<void>;
};

interface UseCompanionActionsProps {
  id?: string;
  reason?: string;
  comment?: string;
  companionExpandedValue?: boolean;
}
export default function useCompanionActions<
  T extends UseCompanionActionsProps,
>({
  onBookmarkMutate,
  onRemoveBookmarkMutate,
  onUpvoteMutate,
  onRemoveUpvoteMutate,
}: UseCompanionActionsParams<T>): UseCompanionActionsRet<T> {
  const { mutateAsync: report } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(({ id, reason, comment }) =>
    companionRequest(`${apiUrl}/graphql`, REPORT_POST_MUTATION, {
      id,
      reason,
      comment,
    }),
  );

  const { mutateAsync: blockSource } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(({ id }) =>
    companionRequest(`${apiUrl}/graphql`, ADD_FILTERS_TO_FEED_MUTATION, {
      filters: {
        excludeSources: [id],
      },
    }),
  );

  const { mutateAsync: disableCompanion } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(() => browser.runtime.sendMessage({ type: 'DISABLE_COMPANION' }));

  const { mutateAsync: bookmark } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      companionRequest(`${apiUrl}/graphql`, ADD_BOOKMARKS_MUTATION, {
        data: { postIds: [id] },
      }),
    {
      onMutate: onBookmarkMutate,
      onError: (_, __, rollback) => {
        rollback?.();
      },
    },
  );

  const { mutateAsync: removeBookmark } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      companionRequest(`${apiUrl}/graphql`, REMOVE_BOOKMARK_MUTATION, {
        id,
      }),
    {
      onMutate: onRemoveBookmarkMutate,
      onError: (_, __, rollback) => {
        rollback?.();
      },
    },
  );

  const { mutateAsync: upvote } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      companionRequest(`${apiUrl}/graphql`, UPVOTE_MUTATION, {
        id,
      }),
    {
      onMutate: onUpvoteMutate,
      onError: (_, __, rollback) => {
        rollback?.();
      },
    },
  );

  const { mutateAsync: removeUpvote } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      companionRequest(`${apiUrl}/graphql`, CANCEL_UPVOTE_MUTATION, {
        id,
      }),
    {
      onMutate: onRemoveUpvoteMutate,
      onError: (_, __, rollback) => {
        rollback?.();
      },
    },
  );

  const { mutateAsync: removeCompanionHelper } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    () =>
      companionRequest(`${apiUrl}/graphql`, UPDATE_ALERTS, {
        data: {
          companionHelper: false,
        },
      }),
    {
      onMutate: () => undefined,
      onError: (_, __, rollback) => {
        rollback?.();
      },
    },
  );

  const { mutateAsync: toggleCompanionExpanded } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ companionExpandedValue }) =>
      companionRequest(`${apiUrl}/graphql`, UPDATE_USER_SETTINGS_MUTATION, {
        data: {
          companionExpanded: companionExpandedValue,
        },
      }),
    {
      onMutate: () => undefined,
      onError: (_, __, rollback) => {
        rollback?.();
      },
    },
  );

  return useMemo(
    () => ({
      report,
      blockSource,
      bookmark,
      removeBookmark,
      upvote,
      removeUpvote,
      disableCompanion,
      removeCompanionHelper,
      toggleCompanionExpanded,
    }),
    [
      report,
      blockSource,
      bookmark,
      removeBookmark,
      upvote,
      removeUpvote,
      disableCompanion,
      removeCompanionHelper,
      toggleCompanionExpanded,
    ],
  );
}
