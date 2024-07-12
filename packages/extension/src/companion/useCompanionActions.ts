import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import browser from 'webextension-polyfill';
import {
  ADD_BOOKMARKS_MUTATION,
  REMOVE_BOOKMARK_MUTATION,
} from '@dailydotdev/shared/src/graphql/posts';
import { ADD_FILTERS_TO_FEED_MUTATION } from '@dailydotdev/shared/src/graphql/feedSettings';
import { UPDATE_ALERTS } from '@dailydotdev/shared/src/graphql/alerts';
import { UPDATE_USER_SETTINGS_MUTATION } from '@dailydotdev/shared/src/graphql/settings';
import { MutateFunc } from '@dailydotdev/shared/src/lib/query';
import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';
import { companionRequest } from './companionRequest';

type UseCompanionActionsParams<T> = {
  onBookmarkMutate: MutateFunc<T>;
  onRemoveBookmarkMutate: MutateFunc<T>;
};
type UseCompanionActionsRet<T> = {
  blockSource: (variables: T) => Promise<void>;
  bookmark: (variables: T) => Promise<void>;
  removeBookmark: (variables: T) => Promise<void>;
  disableCompanion: (variables: T) => Promise<void>;
  removeCompanionHelper: (variables: T) => Promise<void>;
  toggleCompanionExpanded: (variables: T) => Promise<void>;
};

interface UseCompanionActionsProps {
  id?: string;
  reason?: string;
  comment?: string;
  companionExpandedValue?: boolean;
  tags?: string[];
}
export default function useCompanionActions<
  T extends UseCompanionActionsProps,
>({
  onBookmarkMutate,
  onRemoveBookmarkMutate,
}: UseCompanionActionsParams<T>): UseCompanionActionsRet<T> {
  const { mutateAsync: blockSource } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(({ id }) =>
    companionRequest(ADD_FILTERS_TO_FEED_MUTATION, {
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
  >(() =>
    browser.runtime.sendMessage({
      type: ExtensionMessageType.DisableCompanion,
    }),
  );

  const { mutateAsync: bookmark } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(
    ({ id }) =>
      companionRequest(ADD_BOOKMARKS_MUTATION, {
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
      companionRequest(REMOVE_BOOKMARK_MUTATION, {
        id,
      }),
    {
      onMutate: onRemoveBookmarkMutate,
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
      companionRequest(UPDATE_ALERTS, {
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
      companionRequest(UPDATE_USER_SETTINGS_MUTATION, {
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
      blockSource,
      bookmark,
      removeBookmark,
      disableCompanion,
      removeCompanionHelper,
      toggleCompanionExpanded,
    }),
    [
      blockSource,
      bookmark,
      removeBookmark,
      disableCompanion,
      removeCompanionHelper,
      toggleCompanionExpanded,
    ],
  );
}
