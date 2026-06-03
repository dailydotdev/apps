import { useMutation } from '@tanstack/react-query';
import type { Squad } from '../../graphql/sources';
import { toggleFavoriteSource } from '../../graphql/squads';
import { useBoot } from '../useBoot';

type UseSquadFavorite = {
  toggleFavorite: (squad: Squad) => void;
  isPending: boolean;
};

export const useSquadFavorite = (): UseSquadFavorite => {
  const { updateSquad } = useBoot();

  const { mutate, isPending } = useMutation({
    mutationFn: (squad: Squad) => {
      if (!squad.id) {
        throw new Error('Cannot toggle favorite on squad without id');
      }
      return toggleFavoriteSource(squad.id);
    },
    onMutate: (squad) => {
      const previous = squad.favoritedAt ?? null;
      updateSquad({
        ...squad,
        favoritedAt: previous ? null : new Date().toISOString(),
      });
      return { previous };
    },
    onError: (_err, squad, context) => {
      updateSquad({ ...squad, favoritedAt: context?.previous ?? null });
    },
  });

  return { toggleFavorite: mutate, isPending };
};
