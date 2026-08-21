import { useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { deleteSquad } from '../graphql/squads';
import type { Squad } from '../graphql/sources';
import type { PromptOptions } from './usePrompt';
import { usePrompt } from './usePrompt';
import { useBoot } from './useBoot';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import { ButtonColor } from '../components/buttons/Button';
import { useToastNotification } from './useToastNotification';
import { DEFAULT_ERROR } from '../graphql/common';

interface UseDeleteSquadModal {
  onDeleteSquad: () => void;
  isPending: boolean;
}

type UseDeleteSquadProps = {
  squad: Squad;
  callback?: (params?: unknown) => Promise<unknown> | unknown;
};

export const useDeleteSquad = ({
  squad,
  callback,
}: UseDeleteSquadProps): UseDeleteSquadModal => {
  const { logEvent } = useLogContext();
  const { showPrompt } = usePrompt();
  const { deleteSquad: deleteCachedSquad } = useBoot();
  const { displayToast } = useToastNotification();

  const { mutateAsync: deleteSquadMutation, isPending } = useMutation({
    mutationFn: async () => {
      logEvent({
        event_name: LogEvent.DeleteSquad,
        extra: JSON.stringify({ squad: squad.id! }),
      });
      await deleteSquad(squad.id!);
      deleteCachedSquad(squad.id!);
      await callback?.();
    },
    onError: () => displayToast(DEFAULT_ERROR),
  });

  const onDeleteSquad = useCallback(async () => {
    const options: PromptOptions = {
      title: `Delete ${squad.name}`,
      description: squad.active
        ? `Deleting ${squad.name} means you and all Squad members will lose access to all posts that were shared in the Squad. Are you sure?`
        : `Deleting your Squad will free up your handle and members you invited will not be able to join`,
      okButton: {
        title: 'Yes, delete Squad',
        color: ButtonColor.Ketchup,
      },
      onConfirm: deleteSquadMutation,
    };

    await showPrompt(options).catch(() => false);
  }, [deleteSquadMutation, showPrompt, squad.active, squad.name]);

  return useMemo(
    () => ({ isPending, onDeleteSquad }),
    [isPending, onDeleteSquad],
  );
};
