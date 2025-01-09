import { useMutation } from '@tanstack/react-query';
import type {
  CreatePostModerationProps,
  UpdatePostModerationProps,
} from '../../graphql/posts';
import {
  createSourcePostModeration,
  updateSourcePostModeration,
} from '../../graphql/posts';
import { usePrompt } from '../usePrompt';
import {
  createModerationPromptProps,
  editModerationPromptProps,
} from '../../components/squads/utils';
import type { ApiErrorResult } from '../../graphql/common';
import type { SourcePostModeration } from '../../graphql/squads';

interface UseSourcePostModeration {
  isPending: boolean;
  isSuccess: boolean;
  onCreatePostModeration: (
    post: CreatePostModerationProps,
  ) => Promise<SourcePostModeration>;
  onUpdatePostModeration: (
    post: UpdatePostModerationProps,
  ) => Promise<SourcePostModeration>;
}

interface UseSquadModerationProps {
  onSuccess?: (data: SourcePostModeration) => void;
  onError?: (error: ApiErrorResult) => void;
  onSettled?: () => void;
  onMutate?: () => void;
}

const useSourcePostModeration = ({
  onSuccess,
  onError,
  onSettled,
  onMutate,
}: UseSquadModerationProps = {}): UseSourcePostModeration => {
  const { showPrompt } = usePrompt();
  const {
    mutateAsync: onCreatePostModeration,
    isPending: isCreatePending,
    isSuccess: isCreateSuccess,
  } = useMutation({
    mutationFn: createSourcePostModeration,
    onSuccess: async (moderatedPost) => {
      await showPrompt(
        moderatedPost.post
          ? editModerationPromptProps
          : createModerationPromptProps,
      );
      onSuccess?.(moderatedPost);
    },
    onError,
    onSettled,
    onMutate,
  });

  const {
    mutateAsync: onUpdatePostModeration,
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
  } = useMutation({
    mutationFn: updateSourcePostModeration,
    onSuccess: async (data) => {
      await showPrompt(editModerationPromptProps);
      onSuccess?.(data);
    },
    onError,
    onSettled,
    onMutate,
  });

  return {
    onCreatePostModeration,
    onUpdatePostModeration,
    isPending: isCreatePending || isUpdatePending,
    isSuccess: isCreateSuccess || isUpdateSuccess,
  };
};

export default useSourcePostModeration;
