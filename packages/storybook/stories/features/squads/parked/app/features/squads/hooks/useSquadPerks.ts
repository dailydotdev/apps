import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import type {
  SquadPerk,
  SquadPerkInput,
} from '../../../graphql/squadJobsPerks';
import {
  addSquadPerk,
  addSquadPerkCodes,
  claimSquadPerk,
  removeSquadPerk,
  reorderSquadPerks,
  squadPerkQueryOptions,
  squadPerksQueryOptions,
  updateSquadPerk,
} from '../../../graphql/squadJobsPerks';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { labels } from '@dailydotdev/shared/src/lib/labels';
import { getSquadId, hasSquadFeature } from '../lib/features';

export const useSquadPerks = (squad: Squad) => {
  const { user } = useAuthContext();
  const { data, isPending } = useQuery(squadPerksQueryOptions({ squad, user }));

  return {
    isEnabled: hasSquadFeature(squad, 'perks'),
    perks: data ?? [],
    isPending,
  };
};

/**
 * The API says why a write failed (ended, every code taken, not one of
 * the squad's products, the 10-perk limit). Field-level problems arrive
 * as a validation error, which the forms mostly catch first.
 */
export const getSquadMutationErrorMessage = (error: unknown): string => {
  const first = (error as ApiErrorResult)?.response?.errors?.[0];
  if (
    !first?.message ||
    first.extensions?.code === ApiError.ZodValidationError
  ) {
    return first
      ? 'Some fields are too long or not valid.'
      : labels.error.generic;
  }

  return first.message;
};

export const useSquadPerkMutations = (squad: Squad) => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { queryKey } = squadPerksQueryOptions({ squad, user });
  const setPerks = (update: (perks: SquadPerk[]) => SquadPerk[]) =>
    client.setQueryData<SquadPerk[]>(queryKey, (perks) => update(perks ?? []));
  const setPerk = (perk: SquadPerk) => {
    setPerks((perks) =>
      perks.map((item) => (item.id === perk.id ? perk : item)),
    );
    client.setQueryData(
      squadPerkQueryOptions({ id: perk.id, user }).queryKey,
      perk,
    );
  };
  const onError = (error: unknown) =>
    displayToast(getSquadMutationErrorMessage(error));

  const { mutateAsync: onAdd } = useMutation({
    mutationFn: (input: SquadPerkInput) =>
      addSquadPerk({ sourceId: getSquadId(squad), input }),
    onSuccess: (perk) => {
      setPerks((perks) => [perk, ...perks]);
      displayToast('The perk has been added');
    },
    onError,
  });

  const { mutateAsync: onUpdate } = useMutation({
    mutationFn: updateSquadPerk,
    onSuccess: (perk) => {
      setPerk(perk);
      displayToast('The perk has been updated');
    },
    onError,
  });

  // The form explains a failed upload itself, and where to retry
  const { mutateAsync: onAddCodes } = useMutation({
    mutationFn: addSquadPerkCodes,
    onSuccess: (perk) => setPerk(perk),
  });

  const { mutateAsync: onRemove, isPending: isRemoving } = useMutation({
    mutationFn: removeSquadPerk,
    onSuccess: (_, id) => {
      setPerks((perks) => perks.filter((item) => item.id !== id));
      displayToast('The perk has been removed');
    },
    onError,
  });

  const { mutate: onReorder } = useMutation({
    mutationFn: (ids: string[]) =>
      reorderSquadPerks({ sourceId: getSquadId(squad), ids }),
    onMutate: (ids) => {
      const previous = client.getQueryData<SquadPerk[]>(queryKey);
      setPerks((perks) =>
        ids
          .map((id) => perks.find((perk) => perk.id === id))
          .filter((perk): perk is SquadPerk => !!perk),
      );

      return { previous };
    },
    onSuccess: (perks) => client.setQueryData(queryKey, perks),
    onError: (error, __, context) => {
      client.setQueryData(queryKey, context?.previous);
      onError(error);
    },
  });

  const { mutateAsync: onClaim, isPending: isClaiming } = useMutation({
    mutationFn: claimSquadPerk,
    onSuccess: (perk) => setPerk(perk),
    onError,
  });

  return {
    onAdd,
    onUpdate,
    onAddCodes,
    onRemove,
    onReorder,
    onClaim,
    isRemoving,
    isClaiming,
  };
};
