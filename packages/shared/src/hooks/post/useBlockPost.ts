import { useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';
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

interface BlockData {
  showTagsPanel?: boolean;
  blocked?: DownvoteBlocked;
}

interface UseBlockPost {
  data: BlockData;
  blockedTags: number;
  onClose(): void;
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
  });
  const setShowTagsPanel = (params: BlockData) =>
    client.setQueryData<BlockData>(key, (current) => ({
      ...current,
      ...params,
    }));

  const value = useMemo<BlockData>(
    () => ({
      ...data,
      showTagsPanel: checkHasCompleted(ActionType.HideBlockPanel)
        ? undefined
        : data?.showTagsPanel,
      blockedTags: 0,
    }),
    [data, checkHasCompleted],
  );

  const updateFeedPreferences = async (
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
  };

  const onUndo = async () => {
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
  };

  return {
    data: value,
    blockedTags: getBlockedLength(value?.blocked),
    onClose: () => setShowTagsPanel({ showTagsPanel: false }),
    onShowPanel: () => setShowTagsPanel({ showTagsPanel: true }),
    onDismissPermanently: () => {
      completeAction(ActionType.HideBlockPanel);
      setShowTagsPanel({ showTagsPanel: undefined });
    },
    onUndo,
    onReport: () => {
      setShowTagsPanel({ showTagsPanel: false });
    },
    onBlock: async (tags, shouldBlockSource) => {
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
  };
};
