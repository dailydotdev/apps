import { useMemo } from 'react';
import { CopyNotifyFunction, useCopyLink } from './useCopyLink';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';
import { Squad } from '../graphql/sources';

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

  const invitation = useMemo(() => {
    const permalink = squad?.permalink;
    const token = squad?.currentMember?.referralToken;

    if (!permalink || !token) {
      return undefined;
    }

    return `${permalink}/${token}`;
  }, [squad]);
  const [copying, copyLink] = useCopyLink(() => invitation);

  const trackAndCopyLink = () => {
    trackEvent({
      event_name: AnalyticsEvent.ShareSquadInvitation,
      extra: JSON.stringify({ origin, squad: squad?.id }),
    });

    return copyLink();
  };

  return {
    invitation,
    copying,
    trackAndCopyLink,
  };
};
