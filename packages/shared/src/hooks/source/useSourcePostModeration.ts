import { useMutation } from '@tanstack/react-query';
import {
  CreatePostModerationProps,
  createSourcePostModeration,
  SourcePostModeration,
} from '../../graphql/posts';

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
};

const useSourcePostModeration = ({
  onSuccess,
  onError,
}: UseSquadModerationProps = {}): UseSourcePostModeration => {
  const {
    mutateAsync: onCreatePostModeration,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: createSourcePostModeration,
    onSuccess: async () => {
      onSuccess?.();
    },
    onError: () => {
      onError?.();
    },
  });

  return {
    onCreatePostModeration,
    isPending,
    isSuccess,
  };
};

export default useSourcePostModeration;
