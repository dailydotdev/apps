import { useQuery, useQueryClient } from 'react-query';
import { useCallback, useMemo } from 'react';
import { Post } from '../../graphql/posts';
import { generateStorageKey, StorageTopic } from '../../lib/storage';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import useTagAndSource from '../useTagAndSource';
import { Origin } from '../../lib/analytics';
import {
  BlockTagSelection,
  DownvoteBlocked,
  getBlockedLength,
} from '../../components/post/block/common';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { disabledRefetch } from '../../lib/func';

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
}

interface Params {
  blocks: string[];
  unblocks: string[];
}

const getParams = (tags: BlockTagSelection): Params => {
  const blocks = [];
  const unblocks = [];
  Object.entries(tags).forEach(([tag, shouldBlock]) => {
    const container = shouldBlock ? blocks : unblocks;
    container.push(tag);
  });

  return { blocks, unblocks };
};

export const useBlockPost = (
  post: Post,
  { toastOnSuccess }: UseBlockPostProps = {},
): UseBlockPost => {
  const { openModal } = useLazyModal();
  const { onBlockTags, onUnfollowSource, onUnblockTags, onFollowSource } =
    useTagAndSource({
      origin: Origin.TagsFilter,
      postId: post.id,
    });
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { checkHasCompleted, completeAction } = useActions();
  const key = generateStorageKey(
    StorageTopic.Post,
    `block:${post?.id}`,
    user?.id,
  );
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
      shouldBlockSource: boolean,
    ) => {
      const onUpdateSource = shouldBlockSource
        ? onUnfollowSource
        : onFollowSource;

      const results = await Promise.all([
        onBlockTags({ tags: blocks }),
        onUnblockTags({ tags: unblocks }),
        onUpdateSource({ source: post.source }),
      ]);

      return results.every(({ successful }) => successful);
    },
    [onFollowSource, onUnfollowSource, onBlockTags, onUnblockTags, post],
  );

  const onUndo = useCallback(async () => {
    const { blocked = {} } = value;
    const { blocks } = getParams(blocked.tags);
    const successful = await updateFeedPreferences(
      [],
      blocks,
      blocked.sourceIncluded,
    );

    if (!successful) return;

    setShowTagsPanel({
      showTagsPanel: undefined,
      blocked: {},
    });
  }, [value, setShowTagsPanel, updateFeedPreferences]);

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
      props: { post, onReport: () => null, postIndex: -1 },
    });
    setShowTagsPanel({ showTagsPanel: false });
  }, [openModal, setShowTagsPanel, post]);

  const onBlock = useCallback(
    async (tags, shouldBlockSource) => {
      const { blocks } = getParams(tags);
      const successful = await updateFeedPreferences(
        blocks,
        [],
        shouldBlockSource,
      );

      if (!successful) return;

      setShowTagsPanel({
        showTagsPanel: toastOnSuccess ? undefined : false,
        blocked: { tags, sourceIncluded: shouldBlockSource },
      });
    },
    [setShowTagsPanel, updateFeedPreferences, toastOnSuccess],
  );

  return {
    data: value,
    blockedTags: getBlockedLength(value?.blocked),
    onClose,
    onShowPanel,
    onDismissPermanently,
    onUndo,
    onReport,
    onBlock,
  };
};
