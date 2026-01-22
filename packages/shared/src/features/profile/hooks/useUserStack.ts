import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type {
  UserStack,
  AddUserStackInput,
  UpdateUserStackInput,
  ReorderUserStackInput,
} from '../../../graphql/user/userStack';
import {
  getUserStack,
  addUserStack,
  updateUserStack,
  deleteUserStack,
  reorderUserStack,
} from '../../../graphql/user/userStack';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';

export function useUserStack(user: PublicProfile | null) {
  const queryClient = useQueryClient();
  const { user: loggedUser } = useAuthContext();
  const isOwner = loggedUser?.id === user?.id;

  const queryKey = generateQueryKey(RequestKey.UserStack, user, 'profile');

  const query = useQuery({
    queryKey,
    queryFn: () => getUserStack(user?.id as string),
    staleTime: StaleTime.Default,
    enabled: !!user?.id,
  });

  const stackItems = useMemo(
    () => query.data?.edges?.map(({ node }) => node) ?? [],
    [query.data],
  );

  // Group items by section
  const groupedBySection = useMemo(() => {
    const groups: Record<string, UserStack[]> = {};
    stackItems.forEach((item) => {
      if (!groups[item.section]) {
        groups[item.section] = [];
      }
      groups[item.section].push(item);
    });
    return groups;
  }, [stackItems]);

  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const addMutation = useMutation({
    mutationFn: (input: AddUserStackInput) => addUserStack(input),
    onSuccess: invalidateQuery,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserStackInput }) =>
      updateUserStack(id, input),
    onSuccess: invalidateQuery,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserStack(id),
    onSuccess: invalidateQuery,
  });

  const reorderMutation = useMutation({
    mutationFn: (items: ReorderUserStackInput[]) => reorderUserStack(items),
    onSuccess: invalidateQuery,
  });

  return {
    ...query,
    stackItems,
    groupedBySection,
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
