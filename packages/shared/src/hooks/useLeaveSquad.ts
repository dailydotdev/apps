import { useCallback, useContext } from 'react';
import { leaveSquad } from '../graphql/squads';
import { Squad } from '../graphql/sources';
import { PromptOptions, usePrompt } from './usePrompt';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';
import { ButtonColor } from '../components/buttons/Button';
import { useSquads } from './squads/useSquads';

type UseLeaveSquad = () => Promise<boolean>;

type UseLeaveSquadProps = {
  squad: Squad;
  callback?: (params?: unknown) => void;
};

export const useLeaveSquad = ({ squad }: UseLeaveSquadProps): UseLeaveSquad => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { showPrompt } = usePrompt();
  const { deleteSquad: deleteCachedSquad } = useSquads();

  const onLeaveSquad = useCallback(async () => {
    const options: PromptOptions = {
      title: `Leave ${squad.name}`,
      description: `Leaving ${squad.name} means that you will lose your access to all posts that were shared in the Squad`,
      okButton: {
        title: 'Yes, leave Squad',
        color: ButtonColor.Ketchup,
      },
    };
    const left = await showPrompt(options);

    if (left) {
      trackEvent({
        event_name: AnalyticsEvent.LeaveSquad,
        extra: JSON.stringify({ squad: squad.id }),
      });
      await leaveSquad(squad.id);
      await deleteCachedSquad(squad.id);
    }

    return left;
  }, [deleteCachedSquad, showPrompt, squad, trackEvent]);

  return onLeaveSquad;
};
