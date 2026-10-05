import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
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
import type { ApiErrorResult } from '../../../graphql/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { labels } from '../../../lib/labels';
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

// The API explains why a claim failed (ended, every code taken)
const getClaimError = (error: ApiErrorResult): string =>
  error?.response?.errors?.[0]?.message ?? labels.error.generic;

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
  const onError = () => displayToast(labels.error.generic);

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

  const { mutateAsync: onAddCodes } = useMutation({
    mutationFn: addSquadPerkCodes,
    onSuccess: (perk) => setPerk(perk),
    onError,
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
    onError: (_, __, context) => {
      client.setQueryData(queryKey, context?.previous);
      onError();
    },
  });

  const { mutateAsync: onClaim, isPending: isClaiming } = useMutation({
    mutationFn: claimSquadPerk,
    onSuccess: (perk) => setPerk(perk),
    onError: (error: ApiErrorResult) => displayToast(getClaimError(error)),
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
