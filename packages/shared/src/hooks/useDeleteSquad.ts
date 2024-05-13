import { useContext, useMemo } from 'react';
import { deleteSquad } from '../graphql/squads';
import { Squad } from '../graphql/sources';
import { PromptOptions, usePrompt } from './usePrompt';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';
import { ButtonColor } from '../components/buttons/Button';
import { useSquads } from './squads/useSquads';

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
  const { trackEvent } = useContext(AnalyticsContext);
  const { showPrompt } = usePrompt();
  const { deleteSquad: deleteCachedSquad } = useSquads();

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
      trackEvent({
        event_name: AnalyticsEvent.DeleteSquad,
        extra: JSON.stringify({ squad: squad.id }),
      });
      await deleteSquad(squad.id);
      await deleteCachedSquad(squad.id);
      await callback?.();
    }
  };

  return useMemo(() => ({ onDeleteSquad }), [onDeleteSquad]);
};
