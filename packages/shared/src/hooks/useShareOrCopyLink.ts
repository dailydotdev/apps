import { useLogContext } from '../contexts/LogContext';
import type { CopyNotifyFunction } from './useCopy';
import { useCopyLink } from './useCopy';
import { ShareProvider } from '../lib/share';
import type { LogEvent } from './log/useLogQueue';
import { useGetShortUrl } from './utils/useGetShortUrl';
import type { ReferralCampaignKey } from '../lib';
import { shouldUseNativeShare } from '../lib/func';

export interface UseShareOrCopyLinkProps {
  link: string;
  text: string;
  logObject?: (provider: ShareProvider) => LogEvent;
  shortenUrl?: boolean;
  cid?: ReferralCampaignKey;
}
export function useShareOrCopyLink({
  link,
  text,
  logObject,
  cid,
}: UseShareOrCopyLinkProps): ReturnType<typeof useCopyLink> {
  const { logEvent } = useLogContext();
  const [copying, copyLink] = useCopyLink();
  const { getShortUrl, getTrackedUrl } = useGetShortUrl();

  const onShareOrCopy: CopyNotifyFunction = async () => {
    const logShareEvent = (provider: ShareProvider): void => {
      if (!logObject) {
        return;
      }

      logEvent(logObject(provider));
    };

    if (shouldUseNativeShare()) {
      try {
        // No await before this call: navigator.share needs the user activation
        // the press carried, and shortening spends it — the sheet then never
        // opens. getTrackedUrl carries the same campaign without a request.
        await navigator.share({
          text,
          url: cid ? getTrackedUrl(link, cid) : link,
        });
        logShareEvent(ShareProvider.Native);
      } catch (err) {
        // Dismissing the sheet rejects; nothing to recover from.
      }

      return;
    }

    // Copying can afford the round trip, so it keeps the short link.
    logShareEvent(ShareProvider.CopyLink);
    copyLink({ link: cid ? await getShortUrl(link, cid) : link });
  };

  return [copying, onShareOrCopy];
}
