import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import type {
  UpdateUserWorldSettingsData,
  UserWorldEntitlementsData,
  WorldDistrict,
  WorldEntitlement,
  WorldSettings,
} from '../../graphql/world';
import {
  UPDATE_USER_WORLD_SETTINGS_MUTATION,
  USER_WORLD_ENTITLEMENTS_QUERY,
} from '../../graphql/world';
import { userWorldQueryKey } from './useUserWorld';

/** What a save sends: an absent key is left alone, an explicit null clears it. */
export type WorldSettingsPatch = Partial<
  Pick<WorldSettings, 'name' | 'sky' | 'crest' | 'look' | 'private'>
>;

/**
 * Everything this world may be dressed with, and what granted each one.
 *
 * Lazy on purpose, in both directions: it is only asked for once the owner opens
 * the bench, and only ever for their own world. It is what an EDITOR needs
 * rather than what displaying a world needs — the API folds the districts
 * through the grant tables to answer it, and a visitor never touches that path.
 */
export const useWorldEntitlements = (
  userId: string | undefined,
  enabled: boolean,
): { entitlements?: WorldEntitlement[]; isPending: boolean } => {
  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.UserWorldEntitlements,
      userId ? { id: userId } : undefined,
    ),
    queryFn: async () => {
      const res = await gqlClient.request<UserWorldEntitlementsData>(
        USER_WORLD_ENTITLEMENTS_QUERY,
        { id: userId },
      );
      return res.userWorldEntitlements;
    },
    enabled: !!userId && enabled,
    staleTime: StaleTime.Default,
  });

  return { entitlements: data, isPending: enabled && isPending };
};

export interface UpdateWorldSettings {
  save: (patch: WorldSettingsPatch) => Promise<void>;
  isSaving: boolean;
  error?: Error;
}

export const useUpdateWorldSettings = (userId: string): UpdateWorldSettings => {
  const client = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (patch: WorldSettingsPatch) => {
      const res = await gqlClient.request<UpdateUserWorldSettingsData>(
        UPDATE_USER_WORLD_SETTINGS_MUTATION,
        patch,
      );
      return res.updateUserWorldSettings;
    },
    /* Written straight into the cache the world was raised from rather than
       invalidated: the mutation answers in the same shape the query does, and a
       refetch would take the world back to its stored look for as long as the
       round trip lasted — while the owner is looking at the change they just
       made. The districts on that entry are untouched, so nothing rebuilds. */
    onSuccess: (settings) =>
      client.setQueryData<{
        districts: WorldDistrict[];
        settings: WorldSettings | null;
      }>(userWorldQueryKey(userId), (previous) =>
        previous ? { ...previous, settings: settings ?? null } : previous,
      ),
  });

  const save = useCallback(
    async (patch: WorldSettingsPatch) => {
      await mutateAsync(patch);
    },
    [mutateAsync],
  );

  return { save, isSaving: isPending, error: (error as Error) ?? undefined };
};
