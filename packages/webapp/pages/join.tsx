import { GET_USERNAME_BY_ID_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/hooks';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { isDevelopment } from '@dailydotdev/shared/src/lib/constants';
import request from 'graphql-request';
import { GetServerSideProps } from 'next';
import React, { ReactElement } from 'react';

type PageProps = {
  referrerUsername: string;
};

const Page = ({ referrerUsername }: PageProps): ReactElement => {
  return <div>Join {referrerUsername} at daily.dev</div>;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  res,
}) => {
  const { userid: userId, cid } = query;
  const campaign = Object.values(ReferralCampaignKey).find(
    (item) => item === cid,
  );

  if (!userId || !campaign) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const result = await request<{ user: { username: string } }>(
    graphqlUrl,
    GET_USERNAME_BY_ID_QUERY,
    {
      id: userId,
    },
  );

  if (result) {
    res.setHeader(
      'Set-Cookie',
      [
        `join_referral=${userId}:${campaign}`,
        `max-age=${1 * 365 * 24 * 60 * 60}`,
        isDevelopment ? undefined : 'Secure',
        `domain=${process.env.NEXT_PUBLIC_DOMAIN}`,
      ]
        .filter(Boolean)
        .join('; '),
    );
  }

  return {
    props: {
      referrerUsername: result.user.username,
    },
  };
};

export default Page;
