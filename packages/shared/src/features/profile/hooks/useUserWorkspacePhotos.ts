import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import type { PublicProfile } from '../../../lib/user';
import type {
  AddUserWorkspacePhotoInput,
  ReorderUserWorkspacePhotoInput,
} from '../../../graphql/user/userWorkspacePhoto';
import {
  getUserWorkspacePhotos,
  addUserWorkspacePhoto,
  deleteUserWorkspacePhoto,
  reorderUserWorkspacePhotos,
} from '../../../graphql/user/userWorkspacePhoto';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useProfilePreview } from '../../../hooks/profile/useProfilePreview';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

export const MAX_WORKSPACE_PHOTOS = 5;

export function useUserWorkspacePhotos(user: PublicProfile | null) {
  const queryClient = useQueryClient();
  const { isOwner } = useProfilePreview(user);
  const { logEvent } = useLogContext();

  const queryKey = generateQueryKey(
    RequestKey.UserWorkspacePhotos,
    user,
    'profile',
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getUserWorkspacePhotos(user?.id as string),
    staleTime: StaleTime.Default,
    enabled: !!user?.id,
  });

  const photos = useMemo(
    () => query.data?.edges?.map(({ node }) => node) ?? [],
    [query.data],
  );

  const canAddMore = photos.length < MAX_WORKSPACE_PHOTOS;

  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const addMutation = useMutation({
    mutationFn: (input: AddUserWorkspacePhotoInput) =>
      addUserWorkspacePhoto(input),
    onSuccess: () => {
      invalidateQuery();
      logEvent({
        event_name: LogEvent.AddWorkspacePhoto,
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
