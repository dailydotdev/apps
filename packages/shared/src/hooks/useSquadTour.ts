import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { generateQueryKey, RequestKey } from '../lib/query';

const DEFAULT_SQUAD_TOUR_DATA: SquadTourData = { tourIndex: -1 };
const SQUAD_TOUR_KEY = generateQueryKey(RequestKey.SquadTour, undefined);

interface SquadTourData {
  tourIndex: number;
}

interface UseSquadTour extends SquadTourData {
  onTourIndexChange: (value: number) => void;
  onCloseTour: () => void;
}

export const useSquadTour = (): UseSquadTour => {
  const client = useQueryClient();
  const { data = DEFAULT_SQUAD_TOUR_DATA } = useQuery<SquadTourData>({
    queryKey: SQUAD_TOUR_KEY,
    queryFn: () =>
      client.getQueryData<SquadTourData>(SQUAD_TOUR_KEY) ??
      DEFAULT_SQUAD_TOUR_DATA,
    initialData: DEFAULT_SQUAD_TOUR_DATA,
  });

  const onTourIndexChange = useCallback(
    (tourIndex: number) => {
      client.setQueryData<SquadTourData>(SQUAD_TOUR_KEY, { tourIndex });
    },
    [client],
  );

  const onClose = useCallback(() => {
    onTourIndexChange(-1);
  }, [onTourIndexChange]);

  return useMemo(
    () => ({
      tourIndex: data.tourIndex,
      onCloseTour: onClose,
      onTourIndexChange,
    }),
    [data, onClose, onTourIndexChange],
  );
};
