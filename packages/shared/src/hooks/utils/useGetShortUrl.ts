import type { QueryKey } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { GET_SHORT_URL_QUERY } from '../../graphql/urlShortener';
import { addLogQueryParams } from '../../lib/share';
import { RequestKey, generateQueryKey } from '../../lib/query';
import type { ReferralCampaignKey } from '../../lib';
import { disabledRefetch } from '../../lib/func';
import { gqlClient } from '../../graphql/common';
import type { LoggedUser } from '../../lib/user';

/**
 * How long a press will wait for a shortened link before going with the long
 * one. Short enough that nobody wonders whether they actually clicked.
 */
const shortUrlDeadline = 1500;

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

export const getShortLinkProps = (
  url: string,
  cid?: ReferralCampaignKey,
  user?: LoggedUser,
): { trackedUrl: string; queryKey: QueryKey } => {
  const trackedUrl = cid
    ? addLogQueryParams({ link: url, userId: user?.id, cid })
    : url;
  const queryKey = generateQueryKey(RequestKey.ShortUrl, user, trackedUrl);

  return { trackedUrl, queryKey };
};

export const useGetShortUrl = ({
  query,
}: UseGetShortUrl = {}): UseGetShortUrlResult => {
  const { user, isAuthReady } = useAuthContext();
  const queryClient = useQueryClient();
  const getProps = useCallback(
    (url: string, cid?: ReferralCampaignKey) =>
      getShortLinkProps(url, cid, user),
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

      // Settled either way, so the race below cannot leave a rejection looking
      // for a handler once the deadline has won.
      const shortening = queryClient
        .fetchQuery({
          queryKey,
          queryFn: () => queryShortUrl(trackedUrl),
          staleTime: Infinity,
          // One attempt. Three-with-backoff holds the press for seconds when
          // the shortener is down, and the fallback is a perfectly good link —
          // only longer.
          retry: false,
        })
        .catch(() => null);

      // Every share in the app waits here before anything reaches the
      // clipboard, so the wait is bounded. A request that fails is one thing; a
      // request that never answers at all used to hold the press for as long as
      // the reader was willing to keep looking at it, which is indistinguishable
      // from a button that does nothing.
      const shortened = await Promise.race([
        shortening,
        new Promise<null>((settle) => {
          setTimeout(() => settle(null), shortUrlDeadline);
        }),
      ]);

      return shortened ?? trackedUrl;
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
  const { data: shareLink, isPending } = useQuery({
    queryKey,
    queryFn: () => queryShortUrl(trackedUrl),
    ...disabledRefetch,
    staleTime: Infinity,
    enabled: !!query?.url && isEnabled && !!user,
  });

  return { getShortUrl, getTrackedUrl, shareLink, isLoading: isPending };
};
