import { CopyNotifyFunction, useCopyLink } from './useCopyLink';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';
import { Squad } from '../graphql/squads';

interface UseCopySquadInvitationProps {
  squad: Squad;
  origin?: string;
}

export const useCopySquadInvitation = ({
  squad,
  origin,
}: UseCopySquadInvitationProps): [string, boolean, CopyNotifyFunction] => {
  const { trackEvent } = useAnalyticsContext();
  const token = squad?.currentMember?.referralToken ?? '';
  const invitation = `${squad?.permalink}/${token}`;
  const [copying, copyLink] = useCopyLink(() => invitation);

  const trackAndCopyLink = () => {
    trackEvent({
      event_name: AnalyticsEvent.ShareSquadInvitation,
      extra: JSON.stringify({ origin, squad: squad?.id }),
    });
    return copyLink();
  };

  return [invitation, copying, trackAndCopyLink];
};
