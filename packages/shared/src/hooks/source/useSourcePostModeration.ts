import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
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
    onSuccess: () => {
      onSuccess?.();
    },
    onError: () => {
      onError?.();
    },
  });

  /*
   * We use the effect to show the prompt instead of calling it directly in the onSuccess callback.
   * This is because onSuccess gets called before anything else,
   * which may cause some weird UI behavior such as seeing both the share editor prompt and moderation prompt at the same time.
   */
  useEffect(() => {
    if (isSuccess) {
      showPrompt(createModerationPromptProps);
    }
  }, [isSuccess, showPrompt]);

  return {
    onCreatePostModeration,
    isPending,
    isSuccess,
  };
};

export default useSourcePostModeration;
