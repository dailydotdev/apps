import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import {
  getProfile,
  getProfileSSR,
  PublicProfile,
} from '@dailydotdev/shared/src/lib/user';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import JoinedDate from '@dailydotdev/shared/src/components/profile/JoinedDate';
import GitHubIcon from '@dailydotdev/shared/src/components/icons/GitHub';
import TwitterIcon from '@dailydotdev/shared/src/components/icons/Twitter';
import HashnodeIcon from '@dailydotdev/shared/src/components/icons/Hashnode';
import LinkIcon from '@dailydotdev/shared/src/components/icons/Link';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { reputationGuide } from '@dailydotdev/shared/src/lib/constants';
import { useQuery } from '@tanstack/react-query';
import Rank from '@dailydotdev/shared/src/components/Rank';
import request, { ClientError } from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import {
  USER_READING_RANK_QUERY,
  UserReadingRankData,
} from '@dailydotdev/shared/src/graphql/users';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import DOMPurify from 'dompurify';
import { ProfilePicture } from '@dailydotdev/shared/src/components/ProfilePicture';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import ReferralWidget from '@dailydotdev/shared/src/components/widgets/ReferralWidget';
import {
  ReferralCampaignKey,
  useReferralCampaign,
} from '@dailydotdev/shared/src/hooks';
import styles from './index.module.css';
import NavBar, { tabs } from './NavBar';
import { getLayout as getMainLayout } from '../MainLayout';
import { getTemplatedTitle } from '../utils';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../../pages/404'),
);

export interface ProfileLayoutProps {
  profile: PublicProfile;
  children?: ReactNode;
}

const sanitizeOrNull = (
  purify: DOMPurify.DOMPurifyI,
  value: string,
): string | null => (value ? purify.sanitize(value) : null);

export default function ProfileLayout({
  profile: initialProfile,
  children,
}: ProfileLayoutProps): ReactElement {
  const router = useRouter();
  const { isFallback } = router;
  const { user } = useContext(AuthContext);
  const { isReady, url } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
    enabled: initialProfile?.id === user?.id,
  });

  const queryKey = ['profile', initialProfile?.id];
  const { data: fetchedProfile } = useQuery<PublicProfile>(
    queryKey,
    () => getProfile(initialProfile.id),
    {
      initialData: initialProfile,
      enabled: !!initialProfile,
    },
  );
  // Needed because sometimes initialProfile is defined and fetchedProfile is not
  const profile = fetchedProfile ?? initialProfile;
  const { twitterHandle, githubHandle, hashnodeHandle, portfolioLink } =
    useMemo(() => {
      if (typeof window === 'undefined' || !profile) {
        return {};
      }
      const purify = DOMPurify(globalThis.window);
      return {
        twitterHandle: sanitizeOrNull(purify, profile?.twitter),
        githubHandle: sanitizeOrNull(purify, profile?.github),
        hashnodeHandle: sanitizeOrNull(purify, profile?.hashnode),
        portfolioLink: sanitizeOrNull(purify, profile?.portfolio),
      };
    }, [profile]);
  const userRankQueryKey = ['userRank', initialProfile?.id];
  const { data: userRank } = useQuery<UserReadingRankData>(
    userRankQueryKey,
    () =>
      request(graphqlUrl, USER_READING_RANK_QUERY, {
        id: initialProfile?.id,
        version: 2,
      }),
    {
      enabled: !!initialProfile,
    },
  );

  if (!isFallback && !initialProfile) {
    return <Custom404 />;
  }

  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);

  const isCurrentUserProfile = profile && profile.id === user?.id;

  const Seo: NextSeoProps = profile
    ? {
        title: getTemplatedTitle(profile.name),
        description: profile.bio
          ? profile.bio
          : `Check out ${profile.name}'s profile`,
        openGraph: {
          images: [{ url: profile.image }],
        },
        twitter: {
          handle: profile.twitter,
        },
      }
    : {};

  const isLoadingReferral = isCurrentUserProfile && !isReady;

  if ((isFallback && !initialProfile) || isLoadingReferral) {
    return <></>;
  }

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={profile.image} />
      </Head>
      <NextSeo {...Seo} />
      <ResponsivePageContainer>
        <section
          className={classNames(
            'flex w-full flex-col self-start tablet:-ml-4 tablet:-mr-4 tablet:w-auto tablet:flex-row tablet:self-stretch tablet:overflow-x-hidden',
            styles.header,
          )}
        >
          <div className="mb-6 flex items-center self-start rounded-2xl bg-theme-bg-secondary tablet:mb-0 tablet:flex-col tablet:px-2 tablet:pb-4 tablet:pt-2">
            <ProfilePicture user={profile} size="xxxxlarge" />
            <div className="mx-6 flex flex-col typo-footnote tablet:mx-0 tablet:mt-4 tablet:items-center">
              <a
                href={reputationGuide}
                target="_blank"
                rel="noopener"
                className="my-0.5 text-theme-label-tertiary no-underline"
              >
                Reputation
              </a>
              <span className="my-0.5 font-bold text-theme-label-primary typo-title1">
                {profile.reputation}
              </span>
            </div>
          </div>
          <div className="flex min-w-0 flex-col tablet:flex-1">
            <div className="mb-2 flex items-center">
              <h1 className="m-0 font-bold text-theme-label-primary typo-title3">
                {profile.name}
              </h1>
              {userRank?.userReadingRank?.currentRank > 0 && (
                <Rank
                  rank={userRank.userReadingRank.currentRank}
                  colorByRank
                  data-testid="rank"
                  className="ml-2 h-6 w-6"
                />
              )}
            </div>
            {profile.username && (
              <h2 className="m-0 font-normal text-theme-label-secondary typo-callout">
                @{profile.username}
              </h2>
            )}
            {profile.bio && (
              <p className="mt-3 break-words text-theme-label-tertiary typo-callout">
                {profile.bio}
              </p>
            )}
            <JoinedDate
              className="mt-3 text-theme-label-quaternary typo-footnote"
              date={new Date(profile.createdAt)}
            />
            <div className={classNames('mx-0.5 mt-3 flex', styles.links)}>
              {twitterHandle && (
                <SimpleTooltip content="X">
                  <Button
                    tag="a"
                    href={`https://twitter.com/${twitterHandle}`}
                    target="_blank"
                    rel="noopener"
                    icon={<TwitterIcon />}
                    variant={ButtonVariant.Tertiary}
                  />
                </SimpleTooltip>
              )}
              {githubHandle && (
                <SimpleTooltip content="GitHub">
                  <Button
                    tag="a"
                    href={`https://github.com/${githubHandle}`}
                    target="_blank"
                    rel="noopener"
                    icon={<GitHubIcon secondary />}
                    variant={ButtonVariant.Tertiary}
                  />
                </SimpleTooltip>
              )}
              {hashnodeHandle && (
                <SimpleTooltip content="Hashnode">
                  <Button
                    tag="a"
                    href={`https://hashnode.com/@${hashnodeHandle}`}
                    target="_blank"
                    rel="noopener"
                    icon={<HashnodeIcon secondary />}
                    variant={ButtonVariant.Tertiary}
                  />
                </SimpleTooltip>
              )}
              {portfolioLink && (
                <SimpleTooltip content="Portfolio">
                  <QuaternaryButton
                    tag="a"
                    href={portfolioLink}
                    id="portfolio-link"
                    target="_blank"
                    rel="noopener"
                    icon={<LinkIcon />}
                    className="btn-tertiary w-full"
                    responsiveLabelClass="truncate w-auto tablet:w-full self-center flex-1"
                  >
                    {portfolioLink
                      .replace(/(^\w+:|^)\/\//, '')
                      .replace(/\/?(\?.*)?$/, '')}
                  </QuaternaryButton>
                </SimpleTooltip>
              )}
            </div>
            {isCurrentUserProfile && (
              <Button
                className="mb-0.5 mt-6 self-start"
                variant={ButtonVariant.Secondary}
                tag="a"
                href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}account/profile`}
              >
                Account details
              </Button>
            )}
          </div>
        </section>
        {isCurrentUserProfile && <ReferralWidget url={url} />}
        <NavBar selectedTab={selectedTab} profile={profile} />
        {children}
      </ResponsivePageContainer>
    </>
  );
}

export const getLayout = (
  page: ReactNode,
  props: ProfileLayoutProps,
): ReactNode =>
  getMainLayout(<ProfileLayout {...props}>{page}</ProfileLayout>, null);

interface ProfileParams extends ParsedUrlQuery {
  userId: string;
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<ProfileParams>): Promise<
  GetStaticPropsResult<Omit<ProfileLayoutProps, 'children'>>
> {
  const { userId } = params;
  try {
    const profile = await getProfileSSR(userId);

    return {
      props: {
        profile,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    if (clientError?.response?.errors?.[0]?.extensions?.code === 'FORBIDDEN') {
      return {
        props: { profile: null },
        revalidate: 60,
      };
    }
    throw err;
  }
}
