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
import type { ProfileShowcase } from '../../../graphql/user/profileShowcase';
import { useProfileShowcase } from './useProfileShowcase';
import { useProfilePreview } from '../../../hooks/profile/useProfilePreview';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import type { Connection } from '../../../graphql/common';

export const MAX_HOT_TAKES = 5;
export const HOT_TAKE_LIMIT_REACHED_MESSAGE = `You already have all ${MAX_HOT_TAKES} hot takes. Remove one to add a new one.`;

const selectHotTakes = (data: ProfileShowcase) => data.hotTakes;

const sortHotTakes = (left: HotTake, right: HotTake) => {
  if (left.position !== right.position) {
    return left.position - right.position;
  }

  return left.createdAt.localeCompare(right.createdAt);
};

const replaceHotTakeConnection = (
  connection: Connection<HotTake>,
  hotTakes: HotTake[],
): Connection<HotTake> => ({
  ...connection,
  edges: hotTakes.sort(sortHotTakes).map((node) => ({ node })),
});

const updateHotTakesCache =
  (
    updater: (hotTakes: HotTake[]) => HotTake[],
  ): ((data: ProfileShowcase | undefined) => ProfileShowcase | undefined) =>
  (data) => {
    if (!data) {
      return data;
    }

    return {
      ...data,
      hotTakes: replaceHotTakeConnection(
        data.hotTakes,
        updater(data.hotTakes.edges.map(({ node }) => node)),
      ),
    };
  };

export const useHotTakes = (user: PublicProfile | null) => {
  const { isOwner } = useProfilePreview(user);
  const { logEvent } = useLogContext();

  const { cancel, queryKey, setData, ...query } = useProfileShowcase(
    user,
    selectHotTakes,
  );

  const hotTakes = useMemo(
    () => query.data?.edges?.map(({ node }) => node) ?? [],
    [query.data],
  );

  const canAddMore = hotTakes.length < MAX_HOT_TAKES;

  const addMutation = useMutation({
    mutationFn: (input: AddHotTakeInput) => addHotTake(input),
    onSuccess: async (hotTake, input) => {
      await cancel();
      setData(
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
      await cancel();
      setData(
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
      await cancel();
      setData(
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

      await cancel();
      setData(
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
