import { useContext, useMemo } from 'react';
import { leaveSquad } from '../graphql/squads';
import { Squad } from '../graphql/sources';
import { PromptOptions, usePrompt } from './usePrompt';
import { useBoot } from './useBoot';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';

interface UseLeaveSquad {
  onLeaveSquad: () => void;
}

type UseLeaveSquadProps = {
  squad: Squad;
  callback?: (params?: unknown) => void;
};

export const useLeaveSquad = ({
  squad,
  callback,
}: UseLeaveSquadProps): UseLeaveSquad => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { showPrompt } = usePrompt();
  const { deleteSquad: deleteCachedSquad } = useBoot();

  const onLeaveSquad = async () => {
    const options: PromptOptions = {
      title: `Leave ${squad.name}`,
      description: `Leaving ${squad.name} means that you will lose your access to all posts that were shared in the Squad`,
      okButton: {
        title: 'Leave',
        className: 'btn-secondary',
      },
      cancelButton: {
        title: 'Stay',
        className: 'btn-primary-cabbage',
      },
      className: {
        buttons: 'flex-row-reverse',
      },
    };
    if (await showPrompt(options)) {
      trackEvent({
        event_name: AnalyticsEvent.LeaveSquad,
        extra: JSON.stringify({ squad: squad.id }),
      });
      await leaveSquad(squad.id);
      deleteCachedSquad(squad.id);
      await callback?.();
    }
  };

  return useMemo(() => ({ onLeaveSquad }), [onLeaveSquad]);
};
