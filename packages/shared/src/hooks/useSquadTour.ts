import { useQuery, useQueryClient } from 'react-query';
import { useCallback, useMemo } from 'react';

const SQUAD_TOUR_KEY = 'squadTourKey';

interface SquadTourData {
  tourIndex: number;
}

interface UseSquadTour extends SquadTourData {
  onTourIndexChange: (value: number) => void;
  onCloseTour: () => void;
}

export const useSquadTour = (): UseSquadTour => {
  const client = useQueryClient();
  const { data } = useQuery<SquadTourData>(
    SQUAD_TOUR_KEY,
    () => client.getQueryData(SQUAD_TOUR_KEY),
    { initialData: { tourIndex: -1 } },
  );

  const onTourIndexChange = useCallback(
    (tourIndex: number) => {
      client.setQueryData<SquadTourData>(SQUAD_TOUR_KEY, (value) => ({
        ...value,
        tourIndex,
      }));
    },
    [client],
  );

  const onClose = useCallback(() => {
    onTourIndexChange(-1);
  }, [onTourIndexChange]);

  return useMemo(
    () => ({ ...data, onCloseTour: onClose, onTourIndexChange }),
    [data, onClose, onTourIndexChange],
  );
};
