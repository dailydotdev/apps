import { useMutation } from 'react-query';
import { browser } from 'webextension-polyfill-ts';

type MutateFunc<T> = (variables: T) => Promise<(() => void) | undefined>;
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
};

export default function useCompanionActions<
  T extends { id?: string; reason?: string; comment?: string } = {
    id?: string;
    reason?: string;
    comment?: string;
  },
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
    browser.runtime.sendMessage({
      type: 'REPORT',
      post_id: id,
      reason,
      comment,
    }),
  );

  const { mutateAsync: blockSource } = useMutation<
    void,
    unknown,
    T,
    (() => void) | undefined
  >(({ id, reason, comment }) =>
    browser.runtime.sendMessage({
      type: 'BLOCK_SOURCE',
      source_id: id,
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
    ({ id }) => browser.runtime.sendMessage({ type: 'BOOKMARK', post_id: id }),
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
      browser.runtime.sendMessage({
        type: 'REMOVE_BOOKMARK',
        post_id: id,
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
      browser.runtime.sendMessage({ type: 'UPVOTE_POST', post_id: id }),
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
      browser.runtime.sendMessage({
        type: 'CANCEL_UPVOTE_POST',
        post_id: id,
      }),
    {
      onMutate: onRemoveUpvoteMutate,
      onError: (_, __, rollback) => {
        rollback?.();
      },
    },
  );
  return {
    report,
    blockSource,
    bookmark,
    removeBookmark,
    upvote,
    removeUpvote,
    disableCompanion,
  };
}
