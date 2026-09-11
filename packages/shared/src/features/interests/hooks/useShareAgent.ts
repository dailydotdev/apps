import { useState } from 'react';
import { useShareOrCopyLink } from '../../../hooks/useShareOrCopyLink';
import { getAbsoluteWebappUrl } from '../../../lib/links';
import { ReferralCampaignKey } from '../../../lib/referral';
import type { UserInterest } from '../../../graphql/interests';

export const agentShareLink = (query: string): string =>
  getAbsoluteWebappUrl(`agent?q=${encodeURIComponent(query)}`);

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
