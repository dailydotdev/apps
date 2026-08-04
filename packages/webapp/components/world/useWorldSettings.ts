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
 * Everything this world may be dressed with, and what granted each one. Lazy:
 * only asked for once the owner opens the bench, and only for their own world.
 */
export const useWorldEntitlements = (
  userId: string | undefined,
  enabled: boolean,
): {
  entitlements?: WorldEntitlement[];
  isPending: boolean;
  isError: boolean;
} => {
  const { data, isPending, isError } = useQuery({
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

  return { entitlements: data, isPending: enabled && isPending, isError };
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
    /* Written straight into the cache rather than invalidated: a refetch would
       take the world back to its stored look for the round trip. Districts on
       that entry are untouched, so nothing rebuilds. */
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
