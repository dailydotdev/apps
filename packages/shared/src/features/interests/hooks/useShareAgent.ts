import { useState } from 'react';
import { useShareOrCopyLink } from '../../../hooks/useShareOrCopyLink';
import { webappUrl } from '../../../lib/constants';
import { ReferralCampaignKey } from '../../../lib/referral';
import type { UserInterest } from '../../../graphql/interests';

export const agentShareLink = (query: string): string => {
  const path = `${webappUrl}agent?q=${encodeURIComponent(query)}`;
  // Must be absolute: the share pipeline runs `new URL(link)`, and `webappUrl`
  // is a bare path in development, which threw rather than degrading.
  const origin = globalThis?.location?.origin;

  return origin ? new URL(path, origin).toString() : path;
};

export const useShareAgent = (
  interest?: Pick<UserInterest, 'query'>,
): { isCopying: boolean; isSharing: boolean; onShare: () => void } => {
  const query = interest?.query ?? '';
  const [isCopying, shareOrCopy] = useShareOrCopyLink({
    link: agentShareLink(query),
    text: `I have an agent watching daily.dev for “${query}”`,
    cid: ReferralCampaignKey.ShareAgent,
  });
  const [isSharing, setSharing] = useState(false);

  return {
    isCopying,
    isSharing,
    onShare: async () => {
      if (!query) {
        return;
      }

      setSharing(true);

      try {
        await shareOrCopy();
      } catch {
        // A dismissed system sheet or a refused clipboard rejects; neither is
        // worth escaping the press as an unhandled rejection.
      } finally {
        setSharing(false);
      }
    },
  };
};
