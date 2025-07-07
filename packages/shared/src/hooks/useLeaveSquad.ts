import { useCallback, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { leaveSquad } from '../graphql/squads';
import type { Squad } from '../graphql/sources';
import type { PromptOptions } from './usePrompt';
import { usePrompt } from './usePrompt';
import { useBoot } from './useBoot';
import LogContext from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import { ButtonColor } from '../components/buttons/Button';
import { ContentPreferenceType } from '../graphql/contentPreference';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';

interface Params {
  forceLeave?: boolean;
}

type UseLeaveSquad = (params?: Params) => Promise<boolean>;

type UseLeaveSquadProps = {
  squad: Squad;
  callback?: (params?: unknown) => void;
};

export const useLeaveSquad = ({ squad }: UseLeaveSquadProps): UseLeaveSquad => {
  const queryClient = useQueryClient();
  const { logEvent } = useContext(LogContext);
  const { showPrompt } = usePrompt();
  const { user } = useAuthContext();
  const { deleteSquad: deleteCachedSquad } = useBoot();

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
        await leaveSquad(squad.id);
        deleteCachedSquad(squad.id);

        queryClient.setQueryData(
          generateQueryKey(RequestKey.ContentPreference, user, {
            id: squad.id,
            entity: ContentPreferenceType.Source,
          }),
          {
            status: null,
          },
        );
      }

      return left;
    },
    [deleteCachedSquad, showPrompt, squad, logEvent, user, queryClient],
  );

  return onLeaveSquad;
};
