import { CopyNotifyFunction, useCopyLink } from './useCopy';
import { useLogContext } from '../contexts/LogContext';
import { LogsEvent } from '../lib/logs';
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
  trackAndCopyLink: CopyNotifyFunction;
}

export const useSquadInvitation = ({
  squad,
  origin,
}: UseSquadInvitationProps): UseSquadInvitation => {
  const { trackEvent } = useLogContext();
  const { completeAction } = useActions();

  const invitation = squad.referralUrl;
  const [copying, copyLink] = useCopyLink(() => invitation);

  const trackAndCopyLink = () => {
    trackEvent({
      event_name: LogsEvent.ShareSquadInvitation,
      extra: JSON.stringify({ origin, squad: squad?.id }),
    });

    completeAction(ActionType.SquadInvite);

    return copyLink();
  };

  return {
    invitation,
    copying,
    trackAndCopyLink,
  };
};
