import { useQuery, useQueryClient } from 'react-query';
import { useMemo } from 'react';
import { TutorialKey, useTutorial } from './useTutorial';

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
  const sharePostTutorial = useTutorial({
    key: TutorialKey.ShareSquadPost,
  });

  const onTourIndexChange = (tourIndex: number) =>
    client.setQueryData<SquadTourData>(SQUAD_TOUR_KEY, (value) => ({
      ...value,
      tourIndex,
    }));

  const onClose = () => {
    onTourIndexChange(-1);
    if (!sharePostTutorial.isCompleted) {
      sharePostTutorial.activate();
    }
  };

  return useMemo(
    () => ({ ...data, onCloseTour: onClose, onTourIndexChange }),
    [data, sharePostTutorial],
  );
};
