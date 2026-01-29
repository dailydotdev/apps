import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type {
  AddGearInput,
  ReorderGearInput,
} from '../../../graphql/user/gear';
import {
  getGear,
  addGear,
  deleteGear,
  reorderGear,
} from '../../../graphql/user/gear';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

export function useGear(user: PublicProfile | null) {
  const queryClient = useQueryClient();
  const { user: loggedUser } = useAuthContext();
  const { logEvent } = useLogContext();
  const isOwner = loggedUser?.id === user?.id;

  const queryKey = generateQueryKey(RequestKey.Gear, user, 'profile');

  const query = useQuery({
    queryKey,
    queryFn: () => getGear(user?.id as string),
    staleTime: StaleTime.Default,
    enabled: !!user?.id,
  });

  const gearItems = useMemo(
    () => query.data?.edges?.map(({ node }) => node) ?? [],
    [query.data],
  );

  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const addMutation = useMutation({
    mutationFn: (input: AddGearInput) => addGear(input),
    onSuccess: (_, input) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.AddGear,
        extra: JSON.stringify({ name: input.name }),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGear(id),
    onSuccess: (_, id) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.RemoveGear,
        extra: JSON.stringify({ id }),
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: ReorderGearInput[]) => reorderGear(items),
    onSuccess: (_, items) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.ReorderGear,
        extra: JSON.stringify({ count: items.length }),
      });
    },
  });

  return {
    ...query,
    gearItems,
    isOwner,
    queryKey,
    add: addMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    reorder: reorderMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
}
