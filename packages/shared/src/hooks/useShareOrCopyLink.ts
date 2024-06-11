import { useContext } from 'react';
import LogContext from '../contexts/LogContext';
import { CopyNotifyFunction, useCopyLink } from './useCopy';
import { ShareProvider } from '../lib/share';
import { LogEvent } from './log/useLogQueue';
import { useGetShortUrl } from './utils/useGetShortUrl';
import { ReferralCampaignKey } from '../lib';

interface UseShareOrCopyLinkProps {
  link: string;
  text: string;
  trackObject?: (provider: ShareProvider) => LogEvent;
  shortenUrl?: boolean;
  cid?: ReferralCampaignKey;
}
export function useShareOrCopyLink({
  link,
  text,
  trackObject,
  cid,
}: UseShareOrCopyLinkProps): ReturnType<typeof useCopyLink> {
  const { trackEvent } = useContext(LogContext);
  const [copying, copyLink] = useCopyLink();
  const { getShortUrl } = useGetShortUrl();

  const onShareOrCopy: CopyNotifyFunction = async () => {
    const shortLink = cid ? await getShortUrl(link, cid) : link;

    if ('share' in navigator) {
      try {
        await navigator.share({
          text: `${text}\n${shortLink}`,
        });
        trackEvent(trackObject(ShareProvider.Native));
      } catch (err) {
        // Do nothing
      }
    } else {
      trackEvent(trackObject(ShareProvider.CopyLink));
      copyLink({ link: shortLink });
    }
  };

  return [copying, onShareOrCopy];
}
