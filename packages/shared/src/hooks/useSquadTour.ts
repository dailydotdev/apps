import { useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';

const SQUAD_TOUR_KEY = 'squadTourKey';

interface SquadTourData {
  tourIndex: number;
}

interface UseSquadTour extends SquadTourData {
  onTourIndexChange: (value: number) => void;
}

export const useSquadTour = (): UseSquadTour => {
  const client = useQueryClient();
  const { data } = useQuery<SquadTourData>(
    SQUAD_TOUR_KEY,
    () => client.getQueryData(SQUAD_TOUR_KEY),
    { initialData: { tourIndex: -1 } },
  );

  const onTourIndexChange = (tourIndex: number) =>
    client.setQueryData<SquadTourData>(SQUAD_TOUR_KEY, (value) => ({
      ...value,
      tourIndex,
    }));

  return useMemo(() => ({ ...data, onTourIndexChange }), [data]);
};
