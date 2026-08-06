import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type {
  AddUserWorkspacePhotoInput,
  ReorderUserWorkspacePhotoInput,
} from '../../../graphql/user/userWorkspacePhoto';
import {
  addUserWorkspacePhoto,
  deleteUserWorkspacePhoto,
  reorderUserWorkspacePhotos,
} from '../../../graphql/user/userWorkspacePhoto';
import type { ProfileShowcase } from '../../../graphql/user/profileShowcase';
import { useProfileShowcase } from './useProfileShowcase';
import { useProfilePreview } from '../../../hooks/profile/useProfilePreview';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

export const MAX_WORKSPACE_PHOTOS = 5;

const selectPhotos = (data: ProfileShowcase) => data.userWorkspacePhotos;

export function useUserWorkspacePhotos(user: PublicProfile | null) {
  const { isOwner } = useProfilePreview(user);
  const { logEvent } = useLogContext();

  const {
    queryKey,
    invalidate: invalidateQuery,
    ...query
  } = useProfileShowcase(user, selectPhotos);

  const photos = useMemo(
    () => query.data?.edges?.map(({ node }) => node) ?? [],
    [query.data],
  );

  const canAddMore = photos.length < MAX_WORKSPACE_PHOTOS;

  const addMutation = useMutation({
    mutationFn: (input: AddUserWorkspacePhotoInput) =>
      addUserWorkspacePhoto(input),
    onSuccess: (_, input) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.AddWorkspacePhoto,
        target_id: input.image,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserWorkspacePhoto(id),
    onSuccess: (_, id) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.RemoveWorkspacePhoto,
        extra: JSON.stringify({ id }),
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: ReorderUserWorkspacePhotoInput[]) =>
      reorderUserWorkspacePhotos(items),
    onSuccess: (_, items) => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.ReorderWorkspacePhoto,
        extra: JSON.stringify({ count: items.length }),
      });
    },
  });

  return {
    ...query,
    photos,
    isOwner,
    canAddMore,
    queryKey,
    add: addMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    reorder: reorderMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
}
