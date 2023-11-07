import { GET_REFERRING_USER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import {
  ReferralCampaignKey,
  useActions,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { isDevelopment } from '@dailydotdev/shared/src/lib/constants';
import request from 'graphql-request';
import React, { FunctionComponent, ReactElement, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { NextSeo, NextSeoProps } from 'next-seo';
import { setCookie } from '@dailydotdev/shared/src/lib/cookie';
import { oneYear } from '@dailydotdev/shared/src/lib/dateFormat';
import { useReferralConfig } from '@dailydotdev/shared/src/hooks/referral/useReferralConfig';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { useMutation } from 'react-query';
import { acceptFeatureInvitation } from '@dailydotdev/shared/src/graphql/features';
import {
  ApiErrorResult,
  DEFAULT_ERROR,
} from '@dailydotdev/shared/src/graphql/common';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import { genericReferralConfig, Referral } from '../components/invite/Referral';
import Custom404Seo from './404';
import {
  AISearchInvite,
  AISearchInviteConfig,
} from '../components/invite/AISearchInvite';
import {
  ComponentConfig,
  InviteComponentProps,
  JoinPageProps,
} from '../components/invite/common';
import { defaultOpenGraph } from '../next-seo';

type ReferralRecord<T> = Record<ReferralCampaignKey, T>;

const componentsMap: ReferralRecord<FunctionComponent<InviteComponentProps>> = {
  search: AISearchInvite,
  generic: Referral,
};

const configsMap: ReferralRecord<ComponentConfig> = {
  search: AISearchInviteConfig,
  generic: genericReferralConfig,
};

const Page = ({
  referringUser,
  campaign,
  token,
}: JoinPageProps): ReactElement => {
  const Component = componentsMap[campaign];
  const config = configsMap[campaign];
  const { title, description, images, redirectTo } = useReferralConfig({
    campaign,
    referringUser,
  });
  const { completeAction } = useActions();
  const { displayToast } = useToastNotification();
  const router = useRouter();
  const { user, refetchBoot, showLogin } = useAuthContext();
  const { trackEvent } = useAnalyticsContext();

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

  const {
    mutateAsync: onAcceptMutation,
    isLoading,
    isSuccess,
  } = useMutation(acceptFeatureInvitation, {
    onSuccess: async () => {
      await Promise.all([completeAction(config.actionType), refetchBoot()]);
      router.push(redirectTo);
    },
    onError: (err: ApiErrorResult) => {
      const message = err?.response?.errors?.[0]?.message;
      displayToast(message ?? DEFAULT_ERROR);
    },
  });

  const handleAcceptClick = () => {
    const handleAccept = () =>
      onAcceptMutation({
        token,
        referrerId: referringUser.id,
        feature: config.campaignKey,
      });

    if (!user) {
      return showLogin({
        trigger: config.authTrigger,
        options: {
          onLoginSuccess: handleAccept,
          onRegistrationSuccess: handleAccept,
        },
      });
    }

    // since in the page view, query params are tracked automatically,
    // we don't need to send the params here explicitly
    trackEvent({ event_name: AnalyticsEvent.AcceptInvitation });

    return handleAccept();
  };

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
        campaign={campaign}
        referringUser={referringUser}
        handleAcceptClick={handleAcceptClick}
        isLoading={isLoading}
        isSuccess={isSuccess}
        redirectTo={redirectTo}
      />
    </>
  );
};

interface QueryParams {
  ctoken?: string;
  userid: string;
  cid: ReferralCampaignKey;
}

export const getServerSideProps: GetServerSideProps<JoinPageProps> = async ({
  query,
  res,
}) => {
  const validateUserId = (value: string) => !!value && value !== '404';
  const params = query as unknown as QueryParams;
  const { userid: userId, cid: campaign, ctoken: token = null } = params;

  if (!validateUserId(userId as string) || !campaign) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const result = await request<{ user: JoinPageProps['referringUser'] }>(
    graphqlUrl,
    GET_REFERRING_USER_QUERY,
    {
      id: userId,
    },
  );

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
