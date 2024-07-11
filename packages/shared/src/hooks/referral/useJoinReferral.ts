import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { expireCookie, setCookie } from '../../lib/cookie';
import { isDevelopment } from '../../lib/constants';
import { GET_REFERRING_USER_QUERY } from '../../graphql/users';
import { ApiErrorResult, gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { disabledRefetch } from '../../lib/func';
import { oneYear } from '../../lib/dateFormat';

export const useJoinReferral = (): void => {
  const { user, refetchBoot, isAuthReady } = useAuthContext();
  const router = useRouter();
  const { cid, userid } = router.query;
  const shouldSetReferralCookie = isAuthReady && !user;

  const loadReferralCookie = async () => {
    const campaign = cid as string;
    const referringUserId = userid as string;

    if (campaign && referringUserId) {
      setCookie('join_referral', `${referringUserId}:${campaign}`, {
        path: '/',
        maxAge: oneYear,
        secure: !isDevelopment,
        domain: process.env.NEXT_PUBLIC_DOMAIN,
        sameSite: 'lax',
      });

      try {
        await gqlClient.request<boolean>(GET_REFERRING_USER_QUERY, {
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

    return null;
  };

  useQuery(['join_referral', { cid, userid }], loadReferralCookie, {
    ...disabledRefetch,
    enabled: shouldSetReferralCookie,
    cacheTime: Infinity,
    staleTime: Infinity,
  });
};
