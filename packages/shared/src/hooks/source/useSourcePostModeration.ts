import { useMutation } from '@tanstack/react-query';
import {
  CreatePostModerationProps,
  createSourcePostModeration,
  SourcePostModeration,
} from '../../graphql/posts';
import { usePrompt } from '../usePrompt';
import {
  createModerationPromptProps,
  editModerationPromptProps,
} from '../../components/squads/utils';
import { ApiErrorResult } from '../../graphql/common';

type UseSourcePostModeration = {
  isPending: boolean;
  isSuccess: boolean;
  onCreatePostModeration: (post: CreatePostModerationProps) => Promise<unknown>;
};

type UseSquadModerationProps = {
  onSuccess?: (data: SourcePostModeration) => void;
  onError?: (error: ApiErrorResult) => void;
};

const useSourcePostModeration = ({
  onSuccess,
  onError,
}: UseSquadModerationProps = {}): UseSourcePostModeration => {
  const { showPrompt } = usePrompt();
  const {
    mutateAsync: onCreatePostModeration,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: createSourcePostModeration,
    onSuccess: async (moderatedPost) => {
      await showPrompt(
        moderatedPost.post
          ? createModerationPromptProps
          : editModerationPromptProps,
      );
      onSuccess?.(moderatedPost);
    },
    onError,
  });

  return {
    onCreatePostModeration,
    isPending,
    isSuccess,
  };
};

export default useSourcePostModeration;
