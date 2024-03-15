import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useGetShortUrl } from './useGetShortUrl';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ReferralCampaignKey } from '../../lib/referral';
import { disabledRefetch } from '../../lib/func';

interface UseTrackedLinkProps {
  enabled?: boolean;
  link: string;
  cid: ReferralCampaignKey;
}

interface UseTrackedLink {
  shareLink: string;
  isLoading: boolean;
}

export const useTrackedLink = ({
  enabled,
  link,
  cid,
}: UseTrackedLinkProps): UseTrackedLink => {
  const { user } = useAuthContext();
  const { getShortUrl } = useGetShortUrl();
  const { data: shareLink, isLoading } = useQuery(
    generateQueryKey(RequestKey.TrackingLink, user, link),
    () => getShortUrl(link, cid),
    { enabled: enabled && !!user, ...disabledRefetch, initialData: link },
  );

  return { shareLink, isLoading };
};
