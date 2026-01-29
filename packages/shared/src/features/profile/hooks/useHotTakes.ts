import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type {
  AddHotTakeInput,
  UpdateHotTakeInput,
  ReorderHotTakeInput,
} from '../../../graphql/user/userHotTake';
import {
  getHotTakes,
  addHotTake,
  updateHotTake,
  deleteHotTake,
  reorderHotTakes,
} from '../../../graphql/user/userHotTake';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useProfilePreview } from '../../../hooks/profile/useProfilePreview';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

export const MAX_HOT_TAKES = 5;

export const useHotTakes = (user: PublicProfile | null) => {
  const queryClient = useQueryClient();
  const { isOwner } = useProfilePreview(user);
  const { logEvent } = useLogContext();

  const queryKey = generateQueryKey(RequestKey.UserHotTakes, user, 'profile');

  const query = useQuery({
    queryKey,
    queryFn: () => getHotTakes(user?.id as string),
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
    mutationFn: (input: AddHotTakeInput) => addHotTake(input),
    onSuccess: (_, input) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.AddHotTake,
        extra: JSON.stringify({ title: input.title }),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHotTakeInput }) =>
      updateHotTake(id, input),
    onSuccess: (_, { id }) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.UpdateHotTake,
        extra: JSON.stringify({ id }),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHotTake(id),
    onSuccess: (_, id) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.RemoveHotTake,
        extra: JSON.stringify({ id }),
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: ReorderHotTakeInput[]) => reorderHotTakes(items),
    onSuccess: (_, items) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.ReorderHotTake,
        extra: JSON.stringify({ count: items.length }),
      });
    },
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
};
