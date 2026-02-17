import { GET_REFERRING_USER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/hooks';
import { isDevelopment } from '@dailydotdev/shared/src/lib/constants';
import type { FunctionComponent, ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import type { NextSeoProps } from 'next-seo';
import { NextSeo } from 'next-seo';
import { setCookie } from '@dailydotdev/shared/src/lib/cookie';
import { oneYear } from '@dailydotdev/shared/src/lib/dateFormat';
import { useReferralConfig } from '@dailydotdev/shared/src/hooks/referral/useReferralConfig';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { defaultOpenGraph } from '../../next-seo';
import type { JoinPageProps } from '../../components/invite/common';
import { AISearchInvite } from '../../components/invite/AISearchInvite';
import Custom404Seo from '../404';
import { Referral } from '../../components/invite/Referral';

type ReferralRecord<T> = Record<ReferralCampaignKey, T>;

const componentsMap: ReferralRecord<FunctionComponent<JoinPageProps>> = {
  [ReferralCampaignKey.Search]: AISearchInvite,
  [ReferralCampaignKey.Generic]: Referral,
  [ReferralCampaignKey.SharePost]: Referral,
  [ReferralCampaignKey.ShareComment]: Referral,
  [ReferralCampaignKey.ShareProfile]: Referral,
  [ReferralCampaignKey.ShareSource]: Referral,
  [ReferralCampaignKey.ShareTag]: Referral,
};

const referralCampaignValues = new Set<string>(
  Object.values(ReferralCampaignKey),
);

const getFirstQueryParam = (
  queryParam: string | string[] | undefined,
): string | undefined =>
  Array.isArray(queryParam) ? queryParam[0] : queryParam;

const isReferralCampaignKey = (value: string): value is ReferralCampaignKey =>
  referralCampaignValues.has(value);

const Page = ({
  referringUser,
  campaign,
  token,
}: JoinPageProps): ReactElement => {
  const Component = componentsMap[campaign];
  const { title, description, images, redirectTo } = useReferralConfig({
    campaign,
    referringUser,
  });

  useEffect(() => {
    document.body.classList.add('hidden-scrollbar');

    return () => {
      document.body.classList.remove('hidden-scrollbar');
    };
  }, []);

  useEffect(() => {
    if (!componentsMap[campaign]) {
      return;
    }

    setCookie('join_referral', `${referringUser.id}:${campaign}`, {
      path: '/',
      maxAge: oneYear,
      secure: !isDevelopment,
      domain: process.env.NEXT_PUBLIC_DOMAIN,
      sameSite: 'lax',
    });
  }, [campaign, referringUser.id]);

  const seoProps: NextSeoProps = {
    title,
    description,
    openGraph: { ...defaultOpenGraph, images },
  };
  const seoComponent = <NextSeo {...seoProps} />;

  if (!Component) {
    return (
      <>
        {seoComponent}
        <Custom404Seo />
      </>
    );
  }

  return (
    <>
      {seoComponent}
      <Component
        token={token}
        campaign={campaign}
        redirectTo={redirectTo}
        referringUser={referringUser}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<JoinPageProps> = async ({
  query,
  res,
}) => {
  const validateUserId = (value: string) => !!value && value !== '404';
  const userId = getFirstQueryParam(query.userid);
  const campaignValue = getFirstQueryParam(query.cid);
  const token = getFirstQueryParam(query.ctoken) ?? null;

  if (
    !userId ||
    !validateUserId(userId) ||
    !campaignValue ||
    !isReferralCampaignKey(campaignValue)
  ) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const campaign = campaignValue;

  const result = await gqlClient.request<{
    user: JoinPageProps['referringUser'];
  }>(GET_REFERRING_USER_QUERY, {
    id: userId,
  });

  res.setHeader(
    'Cache-Control',
    `public, max-age=0, must-revalidate, s-maxage=${24 * 60 * 60}`,
  );

  return {
    props: {
      token,
      campaign,
      referringUser: result?.user,
    },
  };
};

export default Page;
