import { useCallback } from 'react';
import type { ReferralCampaignKey } from '../lib/referral';
import type { ShareProvider } from '../lib/share';
import { getShareLink } from '../lib/share';
import { useGetShortUrl } from './utils/useGetShortUrl';

interface OpenShareLinkParams {
  provider: ShareProvider;
  link: string;
  text?: string;
  emailSummary?: string;
  cid?: ReferralCampaignKey;
  shorten?: boolean;
}

export type OpenShareLink = (params: OpenShareLinkParams) => Promise<void>;

/** Opens a network's share page for a link, shortened by default. */
export const useOpenShareLink = (): OpenShareLink => {
  const { getShortUrl } = useGetShortUrl();

  return useCallback(
    async ({ provider, link, text, emailSummary, cid, shorten = true }) => {
      const shareLink = shorten ? await getShortUrl(link, cid) : link;

      globalThis.window?.open(
        getShareLink({ provider, link: shareLink, text, emailSummary }),
        '_blank',
      );
    },
    [getShortUrl],
  );
};
