import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import usePersistentContext from './usePersistentContext';

export enum TutorialKey {
  SEEN_NEW_SQUAD_TOOLTIP_KEY = 'seenNewSquadTooltip',
}

export type UseTutorialProps = {
  key: TutorialKey;
  defaultState?: boolean;
};

export type UseTutorial = {
  isActive: boolean;
  activate: () => void;
  isCompleted: boolean;
  complete: (active?: boolean) => Promise<void>;
  reset: () => Promise<void>;
  isFetched: boolean;
};

export const useTutorial = ({
  key,
  defaultState = false,
}: UseTutorialProps): UseTutorial => {
  const client = useQueryClient();
  const [isCompleted, setCompleted, isFetched] = usePersistentContext(
    `tutorial-${key}`,
    false,
  );

  const queryKey = ['tutorial', 'query', key];

  const { data: isActive } = useQuery(queryKey, () => {
    const current = client.getQueryData(queryKey);

    return !!current;
  });

  const setActive = useCallback(
    (data: boolean) => {
      client.setQueryData(queryKey, data);
    },
    [client, queryKey],
  );

  return useMemo(() => {
    return {
      isActive,
      activate: () => {
        if (isCompleted) {
          return;
        }

        setActive(true);
      },
      isCompleted,
      complete: (active = false) => {
        setActive(!!active);

        return setCompleted(true);
      },
      reset: () => {
        setActive(defaultState);

        return setCompleted(false);
      },
      isFetched,
    };
  }, [isActive, setActive, isCompleted, setCompleted]);
};
