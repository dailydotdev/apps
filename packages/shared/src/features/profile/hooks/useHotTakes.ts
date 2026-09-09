import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type {
  AddHotTakeInput,
  HotTake,
  UpdateHotTakeInput,
  ReorderHotTakeInput,
} from '../../../graphql/user/userHotTake';
import {
  addHotTake,
  updateHotTake,
  deleteHotTake,
  reorderHotTakes,
} from '../../../graphql/user/userHotTake';
import { useProfileShowcase } from './useProfileShowcase';
import { useProfilePreview } from '../../../hooks/profile/useProfilePreview';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import type { Connection } from '../../../graphql/common';

export const MAX_HOT_TAKES = 5;
export const HOT_TAKE_LIMIT_HINT = `You can add up to ${MAX_HOT_TAKES} hot takes`;
export const HOT_TAKE_LIMIT_REACHED_MESSAGE = `You already have all ${MAX_HOT_TAKES} hot takes. Remove one to add a new one.`;

const sortHotTakes = (left: HotTake, right: HotTake) => {
  if (left.position !== right.position) {
    return left.position - right.position;
  }

  return left.createdAt.localeCompare(right.createdAt);
};

const updateHotTakesCache =
  (
    updater: (hotTakes: HotTake[]) => HotTake[],
  ): ((connection: Connection<HotTake>) => Connection<HotTake>) =>
  (connection) => ({
    ...connection,
    edges: [...updater(connection.edges.map(({ node }) => node))]
      .sort(sortHotTakes)
      .map((node) => ({ node })),
  });

export const useHotTakes = (user: PublicProfile | null) => {
  const { isOwner } = useProfilePreview(user);
  const { logEvent } = useLogContext();

  const { queryKey, updateSlice, ...query } = useProfileShowcase(
    user,
    'hotTakes',
  );

  const hotTakes = useMemo(
    () => query.data?.edges?.map(({ node }) => node) ?? [],
    [query.data],
  );

  const canAddMore = hotTakes.length < MAX_HOT_TAKES;

  const addMutation = useMutation({
    mutationFn: (input: AddHotTakeInput) => addHotTake(input),
    onSuccess: async (hotTake, input) => {
      await updateSlice(
        updateHotTakesCache((items) => [
          ...items.filter((item) => item.id !== hotTake.id),
          hotTake,
        ]),
      );
      logEvent({
        event_name: LogEvent.AddHotTake,
        target_id: input.title,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHotTakeInput }) =>
      updateHotTake(id, input),
    onSuccess: async (hotTake, { id }) => {
      await updateSlice(
        updateHotTakesCache((items) =>
          items.map((item) => (item.id === hotTake.id ? hotTake : item)),
        ),
      );
      logEvent({
        event_name: LogEvent.UpdateHotTake,
        extra: JSON.stringify({ id }),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHotTake(id),
    onSuccess: async (_, id) => {
      await updateSlice(
        updateHotTakesCache((items) => items.filter((item) => item.id !== id)),
      );
      logEvent({
        event_name: LogEvent.RemoveHotTake,
        extra: JSON.stringify({ id }),
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: ReorderHotTakeInput[]) => reorderHotTakes(items),
    onSuccess: async (reorderedHotTakes, items) => {
      const hotTakesById = new Map(
        reorderedHotTakes.map((item) => [item.id, item]),
      );

      await updateSlice(
        updateHotTakesCache((currentItems) =>
          currentItems.map((item) => hotTakesById.get(item.id) ?? item),
        ),
      );
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
