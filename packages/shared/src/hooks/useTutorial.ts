import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import usePersistentContext from './usePersistentContext';

export enum TutorialKey {
  SeenNewSquadTooltip = 'seenNewSquadTooltip',
  ShareSquadPost = 'shareSquadPost',
  CopySquadLink = 'copySquadLink',
}

export type UseTutorialProps = {
  key: TutorialKey;
};

export type UseTutorial = {
  isActive: boolean;
  activate: () => void;
  isCompleted: boolean;
  complete: (active?: boolean) => Promise<void>;
  reset: () => Promise<void>;
  isFetched: boolean;
};

export const useTutorial = ({ key }: UseTutorialProps): UseTutorial => {
  const client = useQueryClient();
  const [isCompleted, setCompleted, isFetched] = usePersistentContext(
    `tutorial-${key}`,
    false,
  );

  const queryKey = ['tutorial', 'query', key];

  const { data: isActive } = useQuery(
    queryKey,
    () => {
      const current = client.getQueryData(queryKey);

      return !!current;
    },
    { initialData: false },
  );

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
        setActive(false);

        return setCompleted(false);
      },
      isFetched,
    };
  }, [isActive, setActive, isCompleted, setCompleted]);
};
