import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import type { Squad } from '../../graphql/sources';
import type {
  AddSourceStackInput,
  UpdateSourceStackInput,
  ReorderSourceStackInput,
} from '../../graphql/source/sourceStack';
import {
  getSourceStack,
  addSourceStack,
  updateSourceStack,
  deleteSourceStack,
  reorderSourceStack,
} from '../../graphql/source/sourceStack';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { verifyPermission } from '../../graphql/squads';
import { SourcePermissions as SourcePermissionsEnum } from '../../graphql/sources';

export function useSourceStack(squad: Squad | null) {
  const queryClient = useQueryClient();
  const canEdit = squad
    ? verifyPermission(squad, SourcePermissionsEnum.Edit)
    : false;

  const queryKey = generateQueryKey(RequestKey.SourceStack, null, squad?.id);

  const query = useQuery({
    queryKey,
    queryFn: () => getSourceStack(squad?.id as string),
    staleTime: StaleTime.Default,
    enabled: !!squad?.id,
  });

  const stackItems = useMemo(
    () => query.data?.edges?.map(({ node }) => node) ?? [],
    [query.data],
  );

  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const addMutation = useMutation({
    mutationFn: (input: AddSourceStackInput) =>
      addSourceStack(squad?.id as string, input),
    onSuccess: invalidateQuery,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateSourceStackInput;
    }) => updateSourceStack(id, input),
    onSuccess: invalidateQuery,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSourceStack(id),
    onSuccess: invalidateQuery,
  });

  const reorderMutation = useMutation({
    mutationFn: (items: ReorderSourceStackInput[]) =>
      reorderSourceStack(squad?.id as string, items),
    onSuccess: invalidateQuery,
  });

  return {
    ...query,
    stackItems,
    canEdit,
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
