import { useQuery } from '@tanstack/react-query';
import { SourcePostModeration } from '../../graphql/squads';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { getSourcePostModeration } from '../../graphql/posts';

interface UseSourcePostModerationById {
  moderated: SourcePostModeration;
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
    queryFn: () => getSourcePostModeration({ id }),
    enabled: !!id && enabled,
  });

  return {
    moderated: data,
    isLoading,
  };
};
