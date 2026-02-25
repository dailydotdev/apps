import { useQuery } from '@tanstack/react-query';
import type { SourcePostModeration } from '../../graphql/squads';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { getSourcePostModeration } from '../../graphql/posts';

interface UseSourcePostModerationById {
  moderated: SourcePostModeration | undefined;
  isLoading: boolean;
}

interface UseSourcePostModerationByIdProps {
  id: string | null;
  enabled?: boolean;
}

export const useSourcePostModerationById = ({
  id,
  enabled = true,
}: UseSourcePostModerationByIdProps): UseSourcePostModerationById => {
  const { user } = useAuthContext();
  const { data, isLoading } = useQuery({
    queryKey: generateQueryKey(RequestKey.SourcePostModeration, user, id),
    queryFn: () => {
      if (!id) {
        throw new Error('Source post moderation id is required');
      }

      return getSourcePostModeration({ id });
    },
    enabled: !!id && enabled,
  });

  return {
    moderated: data,
    isLoading,
  };
};
