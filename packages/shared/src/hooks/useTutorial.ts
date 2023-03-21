import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import usePersistentContext from './usePersistentContext';

export enum TutorialKey {
  SEEN_NEW_SQUAD_TOOLTIP_KEY = 'seenNewSquadTooltip',
}

export type UseTutorialProps<T> = {
  key: TutorialKey;
  defaultState?: T;
};

export type UseTutorial<T> = {
  state: T;
  setState: (value: T) => void;
  isCompleted: boolean;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
  isFetched: boolean;
};

export const useTutorial = <T = boolean>({
  key,
  defaultState,
}: UseTutorialProps<T>): UseTutorial<T> => {
  const client = useQueryClient();
  const [isCompleted, setCompleted, isFetched] = usePersistentContext(
    `tutorial-${key}`,
    false,
  );

  const queryKey = ['tutorial', 'query', key];

  const { data: state } = useQuery(queryKey, () => {
    const current = client.getQueryData<T>(queryKey);

    if (typeof current === 'undefined') {
      return defaultState;
    }

    return current;
  });

  const setState = useCallback(
    (data: T) => {
      client.setQueryData(queryKey, data);
    },
    [client, queryKey],
  );

  return useMemo(() => {
    return {
      state,
      setState,
      isCompleted,
      complete: () => setCompleted(true),
      reset: () => setCompleted(false),
      isFetched,
    };
  }, [state, setState, isCompleted, setCompleted]);
};
