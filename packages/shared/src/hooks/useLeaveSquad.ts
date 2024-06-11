import { useCallback, useContext } from 'react';
import { leaveSquad } from '../graphql/squads';
import { Squad } from '../graphql/sources';
import { PromptOptions, usePrompt } from './usePrompt';
import { useBoot } from './useBoot';
import LogContext from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import { ButtonColor } from '../components/buttons/Button';

type UseLeaveSquad = () => Promise<boolean>;

type UseLeaveSquadProps = {
  squad: Squad;
  callback?: (params?: unknown) => void;
};

export const useLeaveSquad = ({ squad }: UseLeaveSquadProps): UseLeaveSquad => {
  const { logEvent } = useContext(LogContext);
  const { showPrompt } = usePrompt();
  const { deleteSquad: deleteCachedSquad } = useBoot();

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
      logEvent({
        event_name: LogEvent.LeaveSquad,
        extra: JSON.stringify({ squad: squad.id }),
      });
      await leaveSquad(squad.id);
      deleteCachedSquad(squad.id);
    }

    return left;
  }, [deleteCachedSquad, showPrompt, squad, logEvent]);

  return onLeaveSquad;
};
