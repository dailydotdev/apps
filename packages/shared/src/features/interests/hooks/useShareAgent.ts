import { useShareOrCopyLink } from '../../../hooks/useShareOrCopyLink';
import { webappUrl } from '../../../lib/constants';
import { ReferralCampaignKey } from '../../../lib/referral';
import type { UserInterest } from '../../../graphql/interests';

/**
 * The link that passes an agent on.
 *
 * Not a link to *this* agent — there is nowhere to send someone, and a
 * conversation of your own findings is not the interesting part anyway. What
 * travels is the standing prompt: the recipient lands on the agents screen with
 * it already in the field, one press from having their own watching the same
 * thing.
 *
 * That makes the loop honest in both directions. The sharer is recommending a
 * question rather than exposing a transcript, and the recipient gets something
 * that keeps working for them rather than a snapshot of someone else's feed.
 */
export const agentShareLink = (query: string): string =>
  `${webappUrl}agent?q=${encodeURIComponent(query)}`;

export const useShareAgent = (
  interest?: Pick<UserInterest, 'query'>,
): { isCopying: boolean; onShare: () => void } => {
  const query = interest?.query ?? '';
  const [isCopying, shareOrCopy] = useShareOrCopyLink({
    link: agentShareLink(query),
    text: `I have an agent watching daily.dev for “${query}”`,
    cid: ReferralCampaignKey.ShareAgent,
  });

  return {
    isCopying,
    onShare: () => {
      if (query) {
        shareOrCopy();
      }
    },
  };
};
