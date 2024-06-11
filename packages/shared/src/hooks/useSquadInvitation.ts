import { CopyNotifyFunction, useCopyLink } from './useCopy';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import { Squad } from '../graphql/sources';
import { useActions } from './useActions';
import { ActionType } from '../graphql/actions';

export interface UseSquadInvitationProps {
  squad: Squad;
  origin: string;
}

export interface UseSquadInvitation {
  invitation: string;
  copying: boolean;
  logAndCopyLink: CopyNotifyFunction;
}

export const useSquadInvitation = ({
  squad,
  origin,
}: UseSquadInvitationProps): UseSquadInvitation => {
  const { logEvent } = useLogContext();
  const { completeAction } = useActions();

  const invitation = squad.referralUrl;
  const [copying, copyLink] = useCopyLink(() => invitation);

  const logAndCopyLink = () => {
    logEvent({
      event_name: LogEvent.ShareSquadInvitation,
      extra: JSON.stringify({ origin, squad: squad?.id }),
    });

    completeAction(ActionType.SquadInvite);

    return copyLink();
  };

  return {
    invitation,
    copying,
    logAndCopyLink,
  };
};
