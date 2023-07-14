import { useEffect } from 'react';
import request from 'graphql-request';
import { useRouter } from 'next/router';
import { setCookie } from '../lib/cookie';
import { isDevelopment } from '../lib/constants';
import { GET_REFERRING_USER_QUERY } from '../graphql/users';
import { graphqlUrl } from '../lib/config';
import { ApiErrorResult } from '../graphql/common';
import { useAuthContext } from '../contexts/AuthContext';

export const useJoinReferral = (): void => {
  const { user } = useAuthContext();
  const router = useRouter();
  const { cid, userid } = router.query;

  useEffect(() => {
    if (user && userid === user.id) {
      return;
    }

    const ONE_YEAR = 1 * 365 * 24 * 60 * 60;
    const campaign = cid as string;
    const referringUserId = userid as string;

    if (campaign && referringUserId) {
      setCookie('join_referral', `${referringUserId}:${campaign}`, {
        maxAge: ONE_YEAR,
        secure: !isDevelopment,
        domain: process.env.NEXT_PUBLIC_DOMAIN,
        sameSite: 'lax',
      });

      const removeCookie = () => {
        setCookie('join_referral', `${referringUserId}:${campaign}`, {
          maxAge: 0,
          secure: !isDevelopment,
          domain: process.env.NEXT_PUBLIC_DOMAIN,
          sameSite: 'lax',
        });
      };

      const checkReferringUser = async () => {
        try {
          await request<boolean>(graphqlUrl, GET_REFERRING_USER_QUERY, {
            id: referringUserId,
          });
        } catch (error) {
          if (
            (error as ApiErrorResult).response?.errors?.[0]?.message ===
            'user not found'
          ) {
            removeCookie();
          }
        }
      };

      checkReferringUser();
    }
  }, [user, cid, userid]);
};
