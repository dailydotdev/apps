import { useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import { useCallback } from 'react';
import { graphqlUrl } from '../../lib/config';
import { useAuthContext } from '../../contexts/AuthContext';
import { GET_SHORT_URL_QUERY } from '../../graphql/urlShortener';
import { addTrackingQueryParams } from '../../lib/share';
import { RequestKey, generateQueryKey } from '../../lib/query';
import { ReferralCampaignKey } from '../referral';

interface UseGetShortUrlResult {
  getShortUrl: (url: string, cid?: ReferralCampaignKey) => Promise<string>;
}

export const useGetShortUrl = (): UseGetShortUrlResult => {
  const { user, isAuthReady } = useAuthContext();
  const queryClient = useQueryClient();

  const getShortUrl = useCallback(
    async (url: string, cid?: ReferralCampaignKey) => {
      if (!url || !isAuthReady || !user) {
        return url;
      }

      const trackingUrl = cid
        ? addTrackingQueryParams({ link: url, userId: user?.id, cid })
        : url;
      const shortUrlKey = generateQueryKey(
        RequestKey.ShortUrl,
        null,
        trackingUrl,
      );

      try {
        const data = await queryClient.fetchQuery(
          shortUrlKey,
          () => request(graphqlUrl, GET_SHORT_URL_QUERY, { url: trackingUrl }),
          {
            staleTime: Infinity,
          },
        );
        return data.getShortUrl;
      } catch (err) {
        return trackingUrl;
      }
    },
    [queryClient, isAuthReady, user],
  );

  return { getShortUrl };
};
