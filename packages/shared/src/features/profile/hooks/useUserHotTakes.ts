import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type {
  AddUserHotTakeInput,
  UpdateUserHotTakeInput,
  ReorderUserHotTakeInput,
} from '../../../graphql/user/userHotTake';
import {
  getUserHotTakes,
  addUserHotTake,
  updateUserHotTake,
  deleteUserHotTake,
  reorderUserHotTakes,
} from '../../../graphql/user/userHotTake';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';

export const MAX_HOT_TAKES = 5;

export function useUserHotTakes(user: PublicProfile | null) {
  const queryClient = useQueryClient();
  const { user: loggedUser } = useAuthContext();
  const isOwner = loggedUser?.id === user?.id;

  const queryKey = generateQueryKey(RequestKey.UserHotTakes, user, 'profile');

  const query = useQuery({
    queryKey,
    queryFn: () => getUserHotTakes(user?.id as string),
    staleTime: StaleTime.Default,
    enabled: !!user?.id,
  });

  const hotTakes = useMemo(
    () => query.data?.edges?.map(({ node }) => node) ?? [],
    [query.data],
  );

  const canAddMore = hotTakes.length < MAX_HOT_TAKES;

  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const addMutation = useMutation({
    mutationFn: (input: AddUserHotTakeInput) => addUserHotTake(input),
    onSuccess: invalidateQuery,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateUserHotTakeInput;
    }) => updateUserHotTake(id, input),
    onSuccess: invalidateQuery,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserHotTake(id),
    onSuccess: invalidateQuery,
  });

  const reorderMutation = useMutation({
    mutationFn: (items: ReorderUserHotTakeInput[]) =>
      reorderUserHotTakes(items),
    onSuccess: invalidateQuery,
  });

  return {
    ...query,
    hotTakes,
    isOwner,
    canAddMore,
    queryKey,
    add: addMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    reorder: reorderMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
}
