import { useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';
import { Post } from '../../graphql/posts';
import { generateStorageKey, StorageTopic } from '../../lib/storage';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import { useLazyModal } from '../useLazyModal';

interface BlockData {
  showTagsPanel?: boolean;
  blockedTags?: number;
}

interface UseBlockPost {
  data: BlockData;
  onClose(): void;
  onShowPanel(): void;
  onDismissPermanently(): void;
  onReport(): void;
  onBlock(list: string[], shouldBlockSource: boolean): void;
}

interface UseBlockPostProps {
  toastOnSuccess?: boolean;
}

export const useBlockPost = (
  post: Post,
  { toastOnSuccess }: UseBlockPostProps = {},
): UseBlockPost => {
  const { openModal } = useLazyModal();
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { checkHasCompleted, completeAction } = useActions();
  const key = generateStorageKey(
    StorageTopic.Post,
    `block:${post?.id}`,
    user?.id,
  );
  const { data } = useQuery<BlockData>(key, () => client.getQueryData(key), {
    initialData: { blockedTags: 0 },
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

  return {
    data: value,
    onClose: () => setShowTagsPanel({ showTagsPanel: false }),
    onShowPanel: () => setShowTagsPanel({ showTagsPanel: true }),
    onDismissPermanently: () => {
      completeAction(ActionType.HideBlockPanel);
      setShowTagsPanel({ showTagsPanel: undefined });
    },
    onReport: () => {
      setShowTagsPanel({ showTagsPanel: false });
    },
    onBlock: (list, shouldBlockSource) => {
      if (toastOnSuccess) {
        // toast
      }

      setShowTagsPanel({ showTagsPanel: false });
    },
  };
};
