import { useCallback, useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { leaveSquad } from '../graphql/squads';
import { Squad } from '../graphql/sources';
import { PromptOptions, usePrompt } from './usePrompt';
import LogContext from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import { ButtonColor } from '../components/buttons/Button';
import { persistedQueryClient } from '../lib/persistedQuery';
import { RequestKey } from '../lib/query';

interface Params {
  forceLeave?: boolean;
}

type UseLeaveSquad = (params?: Params) => Promise<boolean>;

type UseLeaveSquadProps = {
  squad: Squad;
  callback?: (params?: unknown) => void;
};

export const useLeaveSquad = ({ squad }: UseLeaveSquadProps): UseLeaveSquad => {
  const { logEvent } = useContext(LogContext);
  const { showPrompt } = usePrompt();
  const { mutate } = useMutation(leaveSquad, {
    onSuccess: () => {
      persistedQueryClient.invalidateQueries({ queryKey: [RequestKey.Squads] });
    },
  });

  const onLeaveSquad = useCallback(
    async ({ forceLeave = false }: Params = {}) => {
      const options: PromptOptions = {
        title: `Leave ${squad.name}`,
        description: `Leaving ${squad.name} means that you will lose your access to all posts that were shared in the Squad`,
        okButton: {
          title: 'Yes, leave Squad',
          color: ButtonColor.Ketchup,
        },
      };
      const left = forceLeave || (await showPrompt(options));

      if (left) {
        logEvent({
          event_name: LogEvent.LeaveSquad,
          extra: JSON.stringify({ squad: squad.id }),
        });
        mutate(squad.id);
      }

      return left;
    },
    [showPrompt, squad, logEvent],
  );

  return onLeaveSquad;
};
