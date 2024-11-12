import { useMutation } from '@tanstack/react-query';
import {
  CreatePostModerationProps,
  createSourcePostModeration,
  SourcePostModeration,
} from '../../graphql/posts';
import { usePrompt } from '../usePrompt';
import { createModerationPromptProps } from '../../components/squads/utils';

type UseSourcePostModeration = {
  isPending: boolean;
  isSuccess: boolean;
  onCreatePostModeration: (
    post: CreatePostModerationProps,
  ) => Promise<SourcePostModeration>;
};

type UseSquadModerationProps = {
  onSuccess?: () => void;
  onError?: () => void;
  onSettled?: () => void;
};

const useSourcePostModeration = ({
  onSuccess,
  onError,
  onSettled,
}: UseSquadModerationProps = {}): UseSourcePostModeration => {
  const { showPrompt } = usePrompt();
  const {
    mutateAsync: onCreatePostModeration,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: createSourcePostModeration,
    onSuccess: async () => {
      await showPrompt(createModerationPromptProps);
      onSuccess?.();
    },
    onError,
    onSettled,
  });

  return {
    onCreatePostModeration,
    isPending,
    isSuccess,
  };
};

export default useSourcePostModeration;
