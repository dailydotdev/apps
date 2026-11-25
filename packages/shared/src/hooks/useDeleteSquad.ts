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
import { isCompanyPage } from '../features/squads/lib/companyPage';

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
      await Promise.resolve(callback?.()).catch(() => undefined);
    },
    onError: () => displayToast(DEFAULT_ERROR),
  });

  const onDeleteSquad = useCallback(async () => {
    const isCompany = isCompanyPage(squad);
    const squadDescription = squad.active
      ? `Deleting ${squad.name} means you and all Squad members will lose access to all posts that were shared in the Squad. Are you sure?`
      : `Deleting your Squad will free up your handle and members you invited will not be able to join`;
    const options: PromptOptions = {
      title: `Delete ${squad.name}`,
      description: isCompany
        ? `Deleting ${squad.name} removes the page and every post on it, for you and its members. Are you sure?`
        : squadDescription,
      okButton: {
        title: isCompany ? 'Yes, delete page' : 'Yes, delete Squad',
        color: ButtonColor.Ketchup,
      },
      onConfirm: deleteSquadMutation,
    };

    await showPrompt(options);
  }, [deleteSquadMutation, showPrompt, squad]);

  return useMemo(
    () => ({ isPending, onDeleteSquad }),
    [isPending, onDeleteSquad],
  );
};
