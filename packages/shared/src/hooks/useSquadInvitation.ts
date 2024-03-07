import { CopyNotifyFunction, useCopyLink } from './useCopy';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';
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
  const { trackEvent } = useAnalyticsContext();
  const { completeAction } = useActions();

  const invitation = squad.referralUrl;
  const [copying, copyLink] = useCopyLink(() => invitation);

  const trackAndCopyLink = () => {
    trackEvent({
      event_name: AnalyticsEvent.ShareSquadInvitation,
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
