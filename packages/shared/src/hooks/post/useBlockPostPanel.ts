import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { Post, ReadHistoryPost } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import useTagAndSource from '../useTagAndSource';
import { Origin } from '../../lib/log';
import {
  BlockTagSelection,
  DownvoteBlocked,
  getBlockedLength,
  getBlockedMessage,
} from '../../components/post/block/common';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { disabledRefetch, isNullOrUndefined } from '../../lib/func';
import { useToastNotification } from '../useToastNotification';
import { generateQueryKey, RequestKey } from '../../lib/query';

interface BlockData {
  showTagsPanel?: boolean;
  blocked?: DownvoteBlocked;
}

interface UseBlockPost {
  data: BlockData;
  blockedTags: number;
  onClose(forceClose?: boolean): void;
  onShowPanel(): void;
  onDismissPermanently(): void;
  onReport(): void;
  onUndo(): void;
  onBlock(tags: BlockTagSelection, shouldBlockSource: boolean): void;
}

interface UseBlockPostProps {
  toastOnSuccess?: boolean;
  blockedSource?: boolean;
}

interface Params {
  blocks: string[];
  unblocks: string[];
}

const getParams = (tags: BlockTagSelection): Params => {
  const blocks = [];
  const unblocks = [];

  if (tags) {
    Object.entries(tags).forEach(([tag, shouldBlock]) => {
      const container = shouldBlock ? blocks : unblocks;
      container.push(tag);
    });
  }

  return { blocks, unblocks };
};

const ignoredCall = () => Promise.resolve({ successful: true });

export const useBlockPostPanel = (
  post: Post | ReadHistoryPost,
  { toastOnSuccess, blockedSource }: UseBlockPostProps = {},
): UseBlockPost => {
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { onBlockTags, onBlockSource, onUnblockTags, onUnblockSource } =
    useTagAndSource({
      origin: Origin.TagsFilter,
      postId: post?.id,
      shouldInvalidateQueries: false,
    });
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { checkHasCompleted, completeAction } = useActions();
  const key = generateQueryKey(RequestKey.PostKey, user, `block:${post?.id}`);
  const { data } = useQuery<BlockData>(key, () => client.getQueryData(key), {
    initialData: {},
    ...disabledRefetch,
  });
  const setShowTagsPanel = useCallback(
    (params: BlockData) =>
      client.setQueryData<BlockData>(key, (current) => ({
        ...current,
        ...params,
      })),
    [client, key],
  );

  const value = useMemo<BlockData>(
    () => ({
      ...data,
      showTagsPanel: checkHasCompleted(ActionType.HideBlockPanel)
        ? undefined
        : data?.showTagsPanel,
    }),
    [data, checkHasCompleted],
  );

  const updateFeedPreferences = useCallback(
    async (
      blocks: string[],
      unblocks: string[],
      shouldBlockSource?: boolean,
    ) => {
      const onUpdateSource = shouldBlockSource
        ? onBlockSource
        : onUnblockSource;

      const results = await Promise.all([
        blocks.length ? onBlockTags({ tags: blocks }) : ignoredCall(),
        unblocks.length ? onUnblockTags({ tags: unblocks }) : ignoredCall(),
        isNullOrUndefined(shouldBlockSource)
          ? ignoredCall()
          : onUpdateSource({ source: post.source }),
      ]);

      return results.every(({ successful }) => successful);
    },
    [onUnblockSource, onBlockSource, onBlockTags, onUnblockTags, post],
  );

  const onUndo = useCallback(
    async (blocks: string[], shouldBlockSource?: boolean) => {
      const successful = await updateFeedPreferences(
        [],
        blocks,
        shouldBlockSource,
      );

      if (!successful) {
        return;
      }

      setShowTagsPanel({
        showTagsPanel: undefined,
        blocked: {},
      });
    },
    [setShowTagsPanel, updateFeedPreferences],
  );

  const onClose = useCallback(
    (forceClose?: boolean) =>
      setShowTagsPanel({ showTagsPanel: forceClose ? undefined : false }),
    [setShowTagsPanel],
  );

  const onShowPanel = useCallback(
    () => setShowTagsPanel({ showTagsPanel: true }),
    [setShowTagsPanel],
  );

  const onDismissPermanently = useCallback(() => {
    completeAction(ActionType.HideBlockPanel);
    setShowTagsPanel({ showTagsPanel: undefined });
  }, [completeAction, setShowTagsPanel]);

  const onReport = useCallback(() => {
    openModal({
      type: LazyModal.ReportPost,
      props: { post, origin: Origin.TagsFilter },
    });
    setShowTagsPanel({ showTagsPanel: false });
  }, [openModal, setShowTagsPanel, post]);

  const onBlock = useCallback(
    async (tags, shouldBlockSource) => {
      const { blocks } = getParams(tags);
      const hasChangedPreference = blockedSource !== shouldBlockSource;
      const successful = await updateFeedPreferences(
        blocks,
        [],
        hasChangedPreference ? shouldBlockSource : undefined,
      );

      if (!successful) {
        return;
      }

      if (toastOnSuccess) {
        const sourcePreferenceChanged = blockedSource !== shouldBlockSource;
        const noAction = blocks.length === 0 && !sourcePreferenceChanged;
        const onUndoToast = () => {
          onUndo(
            blocks,
            sourcePreferenceChanged ? !shouldBlockSource : undefined,
          );
        };

        displayToast(
          getBlockedMessage(blocks.length, sourcePreferenceChanged),
          {
            onUndo: noAction ? onDismissPermanently : onUndoToast,
            undoCopy: noAction ? `Don't ask again` : 'Undo',
          },
        );
      }

      setShowTagsPanel({
        showTagsPanel: toastOnSuccess ? undefined : false,
        blocked: { tags, sourceIncluded: shouldBlockSource },
      });
    },
    [
      displayToast,
      onDismissPermanently,
      onUndo,
      blockedSource,
      setShowTagsPanel,
      updateFeedPreferences,
      toastOnSuccess,
    ],
  );

  const onUndoPanel = useCallback(() => {
    const { blocked = {} } = value;
    const { blocks } = getParams(blocked.tags);

    return onUndo(
      blocks,
      blockedSource === blocked.sourceIncluded
        ? undefined
        : !blocked.sourceIncluded,
    );
  }, [value, blockedSource, onUndo]);

  return {
    data: value,
    blockedTags: getBlockedLength(value?.blocked),
    onClose,
    onShowPanel,
    onDismissPermanently,
    onUndo: onUndoPanel,
    onReport,
    onBlock,
  };
};
