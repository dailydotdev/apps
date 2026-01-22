import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type {
  UserTool,
  AddUserToolInput,
  UpdateUserToolInput,
  ReorderUserToolInput,
} from '../../../graphql/user/userTool';
import {
  getUserTools,
  addUserTool,
  updateUserTool,
  deleteUserTool,
  reorderUserTools,
} from '../../../graphql/user/userTool';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';

export function useUserTools(user: PublicProfile | null) {
  const queryClient = useQueryClient();
  const { user: loggedUser } = useAuthContext();
  const isOwner = loggedUser?.id === user?.id;

  const queryKey = generateQueryKey(RequestKey.UserTools, user, 'profile');

  const query = useQuery({
    queryKey,
    queryFn: () => getUserTools(user?.id as string),
    staleTime: StaleTime.Default,
    enabled: !!user?.id,
  });

  const toolItems = useMemo(
    () => query.data?.edges?.map(({ node }) => node) ?? [],
    [query.data],
  );

  // Group items by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, UserTool[]> = {};
    toolItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [toolItems]);

  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const addMutation = useMutation({
    mutationFn: (input: AddUserToolInput) => addUserTool(input),
    onSuccess: invalidateQuery,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserToolInput }) =>
      updateUserTool(id, input),
    onSuccess: invalidateQuery,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserTool(id),
    onSuccess: invalidateQuery,
  });

  const reorderMutation = useMutation({
    mutationFn: (items: ReorderUserToolInput[]) => reorderUserTools(items),
    onSuccess: invalidateQuery,
  });

  return {
    ...query,
    toolItems,
    groupedByCategory,
    isOwner,
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
