import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import type { ApiError, ApiErrorResult } from '../../../graphql/common';
import type { Post } from '../../../graphql/posts';
import { BriefingType, GENERATE_BRIEFING } from '../../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../../lib/query';

interface UseGenerateBriefProps {
  onSuccess?: (data: { id: string }) => Promise<void>;
  onError?: (
    error: ApiErrorResult<{
      code: ApiError;
      postId: string;
      createdAt: string;
    }>,
  ) => void;
}

interface UseGenerateBriefReturn {
  generateBrief: (params: { type?: BriefingType }) => void;
  isGenerating: boolean;
}

export const useGenerateBrief = ({
  onSuccess,
  onError,
}: UseGenerateBriefProps = {}): UseGenerateBriefReturn => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      type = BriefingType.Daily,
    }: {
      type: BriefingType;
    }) => {
      const result = await gqlClient.request<{
        generateBriefing: Pick<Post, 'id'>;
      }>(GENERATE_BRIEFING, { type });

      return result.generateBriefing;
    },
    onSuccess: async (data) => {
      await onSuccess?.(data);
      queryClient.removeQueries({
        queryKey: generateQueryKey(RequestKey.Feeds, user, 'briefing'),
      });
    },
    onError: (
      error: ApiErrorResult<{
        code: ApiError;
        postId: string;
        createdAt: string;
      }>,
    ) => {
      onError?.(error);
    },
  });

  return {
    generateBrief: mutate,
    isGenerating: isPending,
  };
};
