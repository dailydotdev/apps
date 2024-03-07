import { useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import { graphqlUrl } from '../../lib/config';
import { useAuthContext } from '../../contexts/AuthContext';
import { GET_SHORT_URL_QUERY } from '../../graphql/urlShortener';
import { addLinkShareTrackingParams } from '../../lib/share';

interface UseGetShortUrlResult {
  getShortUrl: (url: string, cid?: string) => Promise<string>;
}

export const useGetShortUrl = (): UseGetShortUrlResult => {
  const { user, isAuthReady } = useAuthContext();
  const queryClient = useQueryClient();

  if (!isAuthReady || !user) {
    return {
      getShortUrl: async (url: string) => {
        return url;
      },
    };
  }

  return {
    getShortUrl: async (url: string, cid?: string) => {
      if (!url) {
        return url;
      }

      const trackingUrl = cid
        ? addLinkShareTrackingParams(url, user?.id, cid)
        : url;
      const shortUrlKey = ['short_url', trackingUrl];

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
  };
};
