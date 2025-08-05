import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutateFunction } from '@tanstack/react-query';
import type { ClientError } from 'graphql-request';
import type { Squad } from '../../graphql/sources';
import { clearSquadUnreadPosts, getSquad } from '../../graphql/squads';
import type { ApiErrorResult } from '../../graphql/common';
import { ApiError, getApiError } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { generateQueryKey, RequestKey } from '../../lib/query';

interface UseSquadProps {
  handle: string;
}

interface UseSquad {
  squad: Squad;
  isForbidden: boolean;
  isLoading: boolean;
  isFetched: boolean;
  clearUnreadPosts: UseMutateFunction<boolean, Error, void, unknown>;
}

export const useSquad = ({ handle }: UseSquadProps): UseSquad => {
  const {
    isFetched: isBootFetched,
    user,
    squads,
    updateSquads,
  } = useAuthContext();
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(RequestKey.Squad, user, handle);
  const {
    data: squad,
    isLoading,
    isFetched,
    error,
  } = useQuery<Squad, ClientError>({
    queryKey,
    queryFn: () => getSquad(handle),
    enabled: isBootFetched && !!handle,
    retry: false,
  });

  const { mutate: clearUnreadPosts } = useMutation({
    mutationFn: () => clearSquadUnreadPosts(handle),
    onSuccess: (res) => {
      if (!res) {
        return;
      }

      queryClient.setQueryData<Squad>(queryKey, (currentSquad) => {
        if (!currentSquad || !currentSquad?.currentMember) {
          return currentSquad;
        }

        return {
          ...currentSquad,
          currentMember: {
            ...currentSquad.currentMember,
            flags: {
              ...(currentSquad.currentMember.flags ?? {}),
              hasUnreadPosts: false,
            },
          },
        };
      });

      updateSquads(
        squads.map((squadItem) => {
          if (squadItem.handle === handle) {
            return { ...squadItem, hasUnreadPosts: false };
          }
          return squadItem;
        }),
      );
    },
  });

  return {
    squad,
    isLoading,
    isFetched,
    isForbidden: isNullOrUndefined(error)
      ? false
      : !!getApiError(error as ApiErrorResult, ApiError.Forbidden),
    clearUnreadPosts,
  };
};
