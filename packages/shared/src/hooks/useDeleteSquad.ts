import { useContext, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { deleteSquad } from '../graphql/squads';
import { Squad } from '../graphql/sources';
import { PromptOptions, usePrompt } from './usePrompt';
import LogContext from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import { ButtonColor } from '../components/buttons/Button';
import { persistedQueryClient } from '../lib/persistedQuery';
import { RequestKey } from '../lib/query';

interface UseDeleteSquadModal {
  onDeleteSquad: () => void;
}

type UseDeleteSquadProps = {
  squad: Squad;
  callback?: (params?: unknown) => void;
};

export const useDeleteSquad = ({
  squad,
  callback,
}: UseDeleteSquadProps): UseDeleteSquadModal => {
  const { logEvent } = useContext(LogContext);
  const { showPrompt } = usePrompt();
  const { mutate } = useMutation([squad.id], deleteSquad, {
    onSuccess: () => {
      persistedQueryClient.invalidateQueries([RequestKey.Squads]);
    },
  });

  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onDeleteSquad = async () => {
    const options: PromptOptions = {
      title: `Delete ${squad.name}`,
      description: squad.active
        ? `Deleting ${squad.name} means you and all Squad members will lose access to all posts that were shared in the Squad. Are you sure?`
        : `Deleting your Squad will free up your handle and members you invited will not be able to join`,
      okButton: {
        title: 'Yes, delete Squad',
        color: ButtonColor.Ketchup,
      },
    };
    if (await showPrompt(options)) {
      logEvent({
        event_name: LogEvent.DeleteSquad,
        extra: JSON.stringify({ squad: squad.id }),
      });
      mutate(squad.id);
      callback?.();
    }
  };

  return useMemo(() => ({ onDeleteSquad }), [onDeleteSquad]);
};
