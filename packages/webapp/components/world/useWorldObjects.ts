import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type {
  UpdateUserWorldObjectsData,
  WorldObject,
  WorldObjectTarget,
  WorldObjectUpsert,
} from '../../graphql/world';
import { UPDATE_USER_WORLD_OBJECTS_MUTATION } from '../../graphql/world';
import type { UserWorldEntry } from './useUserWorld';
import { userWorldQueryKey } from './useUserWorld';

const MAX_CHANGES = 32;
const TARGET_BATCH_BYTES = 900 * 1024;

type WorldObjectUpdate = {
  upserts: WorldObjectUpsert[];
  reverts: WorldObjectTarget[];
};

const batchesOf = ({
  upserts,
  reverts,
}: WorldObjectUpdate): WorldObjectUpdate[] => {
  const batches: WorldObjectUpdate[] = [];
  const encoder = new TextEncoder();
  let batch: WorldObjectUpdate = { upserts: [], reverts: [] };
  let count = 0;
  let bytes = 0;
  const changes = [
    ...upserts.map((value) => ({ kind: 'upsert' as const, value })),
    ...reverts.map((value) => ({ kind: 'revert' as const, value })),
  ];

  /* Each change is sized once; re-serialising the accumulated batch per item
     would be quadratic in bytes against a near-megabyte cap. */
  changes.forEach((change) => {
    const size = encoder.encode(JSON.stringify(change.value)).byteLength;
    if (
      count > 0 &&
      (count + 1 > MAX_CHANGES || bytes + size > TARGET_BATCH_BYTES)
    ) {
      batches.push(batch);
      batch = { upserts: [], reverts: [] };
      count = 0;
      bytes = 0;
    }
    if (change.kind === 'upsert') {
      batch.upserts.push(change.value);
    } else {
      batch.reverts.push(change.value);
    }
    count += 1;
    bytes += size;
  });

  if (count > 0) {
    batches.push(batch);
  }
  return batches;
};

export const useUpdateWorldObjects = (
  userId: string,
): {
  save: (update: WorldObjectUpdate) => Promise<WorldObject[]>;
  isSaving: boolean;
  error?: Error;
} => {
  const client = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    /* Batches are sent one after another on purpose: each response is the
       complete saved set, so the last one is the authoritative result. */
    mutationFn: (update: WorldObjectUpdate) =>
      batchesOf(update).reduce<Promise<WorldObject[]>>(
        async (previous, data) => {
          await previous;
          const res = await gqlClient.request<UpdateUserWorldObjectsData>(
            UPDATE_USER_WORLD_OBJECTS_MUTATION,
            { data },
          );
          return res.updateUserWorldObjects;
        },
        Promise.resolve([]),
      ),
    onSuccess: (objects) =>
      client.setQueryData<UserWorldEntry>(
        userWorldQueryKey(userId),
        (previous) => (previous ? { ...previous, objects } : previous),
      ),
    /* Batches are not atomic: a mid-sequence failure leaves earlier batches
       persisted, so the truth has to come back from the server rather than
       stand on the pre-save cache. */
    onError: () =>
      client.invalidateQueries({ queryKey: userWorldQueryKey(userId) }),
  });

  const save = useCallback(
    (update: WorldObjectUpdate) => mutateAsync(update),
    [mutateAsync],
  );

  return { save, isSaving: isPending, error: (error as Error) ?? undefined };
};
