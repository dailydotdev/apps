import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { GET_SHORT_URL_QUERY } from '../../graphql/urlShortener';
import { addLogQueryParams } from '../../lib/share';
import { RequestKey, generateQueryKey } from '../../lib/query';
import { ReferralCampaignKey } from '../../lib';
import { disabledRefetch } from '../../lib/func';
import { gqlClient } from '../../graphql/common';

interface LinkAsQuery {
  url: string;
  cid: ReferralCampaignKey;
  enabled?: boolean;
}

interface UseGetShortUrlResult {
  getShortUrl: (url: string, cid?: ReferralCampaignKey) => Promise<string>;
  getTrackedUrl: (url: string, cid?: ReferralCampaignKey) => string;
  shareLink: string;
  isLoading: boolean;
}

interface UseGetShortUrl {
  query?: LinkAsQuery;
}

export const useGetShortUrl = ({
  query,
}: UseGetShortUrl = {}): UseGetShortUrlResult => {
  const { user, isAuthReady } = useAuthContext();
  const queryClient = useQueryClient();
  const getProps = useCallback(
    (url: string, cid?: ReferralCampaignKey) => {
      const trackedUrl = cid
        ? addLogQueryParams({ link: url, userId: user?.id, cid })
        : url;
      const queryKey = generateQueryKey(RequestKey.ShortUrl, user, trackedUrl);

      return { trackedUrl, queryKey };
    },
    [user],
  );

  const queryShortUrl = async (url: string) => {
    const res = await gqlClient.request(GET_SHORT_URL_QUERY, { url });
    return res.getShortUrl;
  };

  const getShortUrl = useCallback(
    async (url: string, cid?: ReferralCampaignKey) => {
      if (!url || !isAuthReady || !user) {
        return url;
      }

      const { trackedUrl, queryKey } = getProps(url, cid);

      try {
        return queryClient.fetchQuery(
          queryKey,
          () => queryShortUrl(trackedUrl),
          {
            staleTime: Infinity,
          },
        );
      } catch (err) {
        return trackedUrl;
      }
    },
    [isAuthReady, user, getProps, queryClient],
  );

  const getTrackedUrl = useCallback(
    (url: string, cid?: ReferralCampaignKey) => {
      const { trackedUrl } = getProps(url, cid);
      return trackedUrl;
    },
    [getProps],
  );

  const isEnabled = query?.enabled ?? true;
  const { queryKey, trackedUrl } = query
    ? getProps(query.url, query.cid)
    : { queryKey: [], trackedUrl: '' };
  const { data: shareLink, isLoading } = useQuery(
    queryKey,
    () => queryShortUrl(trackedUrl),
    {
      ...disabledRefetch,
      staleTime: Infinity,
      enabled: !!query?.url && isEnabled && !!user,
    },
  );

  return { getShortUrl, getTrackedUrl, shareLink, isLoading };
};
