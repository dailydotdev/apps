import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type {
  AddGearInput,
  ReorderGearInput,
} from '../../../graphql/user/gear';
import { addGear, deleteGear, reorderGear } from '../../../graphql/user/gear';
import type { ProfileShowcase } from '../../../graphql/user/profileShowcase';
import { useProfileShowcase } from './useProfileShowcase';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

const selectGear = (data: ProfileShowcase) => data.gear;

export function useGear(user: PublicProfile | null) {
  const { user: loggedUser } = useAuthContext();
  const { logEvent } = useLogContext();
  const isOwner = loggedUser?.id === user?.id;

  const {
    queryKey,
    invalidate: invalidateQuery,
    ...query
  } = useProfileShowcase(user, selectGear);

  const gearItems = useMemo(
    () => query.data?.edges?.map(({ node }) => node) ?? [],
    [query.data],
  );

  const addMutation = useMutation({
    mutationFn: (input: AddGearInput) => addGear(input),
    onSuccess: (_, input) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.AddGear,
        target_id: input.name,
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
