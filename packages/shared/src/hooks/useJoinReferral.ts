import request from 'graphql-request';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { expireCookie, setCookie } from '../lib/cookie';
import { isDevelopment } from '../lib/constants';
import { GET_REFERRING_USER_QUERY } from '../graphql/users';
import { graphqlUrl } from '../lib/config';
import { ApiErrorResult } from '../graphql/common';
import { useAuthContext } from '../contexts/AuthContext';
import { disabledRefetch } from '../lib/func';

export const useJoinReferral = (): void => {
  const { user, refetchBoot, isAuthReady } = useAuthContext();
  const router = useRouter();
  const { cid, userid } = router.query;
  const shouldSetReferralCookie = isAuthReady && !user;

  useQuery(
    ['join_referral', { cid, userid }],
    async () => {
      const ONE_YEAR = 1 * 365 * 24 * 60 * 60;
      const campaign = cid as string;
      const referringUserId = userid as string;

      if (campaign && referringUserId) {
        setCookie('join_referral', `${referringUserId}:${campaign}`, {
          path: '/',
          maxAge: ONE_YEAR,
          secure: !isDevelopment,
          domain: process.env.NEXT_PUBLIC_DOMAIN,
          sameSite: 'lax',
        });

        try {
          await request<boolean>(graphqlUrl, GET_REFERRING_USER_QUERY, {
            id: referringUserId,
          });

          refetchBoot();
        } catch (error) {
          if (
            (error as ApiErrorResult).response?.errors?.[0]?.message ===
            'user not found'
          ) {
            expireCookie('join_referral', {
              path: '/',
              domain: process.env.NEXT_PUBLIC_DOMAIN,
            });
          }
        }
      }
    },
    {
      ...disabledRefetch,
      enabled: shouldSetReferralCookie,
      cacheTime: Infinity,
      staleTime: Infinity,
    },
  );
};
