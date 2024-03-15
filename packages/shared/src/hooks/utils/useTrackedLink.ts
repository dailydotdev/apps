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
  enabled = true,
  link,
  cid,
}: UseTrackedLinkProps): UseTrackedLink => {
  const { user } = useAuthContext();
  const { getShortUrl } = useGetShortUrl();
  console.log('props: ', enabled, link, !!user);
  const { data: shareLink, isLoading } = useQuery(
    generateQueryKey(RequestKey.TrackingLink, user, link),
    async () => {
      console.log('executing ');
      const res = await getShortUrl(link, cid);
      console.log('calling: ', res);

      return res;
    },
    {
      ...disabledRefetch,
      enabled: enabled && !!link && !!user,
    },
  );

  return { shareLink: shareLink ?? link, isLoading };
};
