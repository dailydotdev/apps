import { useMutation } from '@tanstack/react-query';
import {
  CreatePostModerationProps,
  createSourcePostModeration,
  Post,
} from '../../graphql/posts';

type UseSourcePostModeration = {
  isPending: boolean;
  isSuccess: boolean;
  onCreatePostModeration: (post: CreatePostModerationProps) => Promise<Post>;
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
