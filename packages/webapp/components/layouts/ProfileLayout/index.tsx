import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
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
import { useQuery } from 'react-query';
import Rank from '@dailydotdev/shared/src/components/Rank';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  USER_READING_RANK_QUERY,
  UserReadingRankData,
} from '@dailydotdev/shared/src/graphql/users';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import DOMPurify from 'dompurify';
import { ProfilePicture } from '@dailydotdev/shared/src/components/ProfilePicture';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import styles from './index.module.css';
import NavBar, { tabs } from './NavBar';
import { getLayout as getMainLayout } from '../MainLayout';

const AccountDetailsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal" */ '@dailydotdev/shared/src/components/modals/AccountDetailsModal'
    ),
);

const Custom404 = dynamic(() => import('../../../pages/404'));

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

  if (!isFallback && !initialProfile) {
    return <Custom404 />;
  }

  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user } = useContext(AuthContext);
  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);
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

  const userRankQueryKey = ['userRank', initialProfile?.id];
  const { data: userRank } = useQuery<UserReadingRankData>(
    userRankQueryKey,
    () =>
      request(`${apiUrl}/graphql`, USER_READING_RANK_QUERY, {
        id: initialProfile?.id,
        version: 2,
      }),
    {
      enabled: !!initialProfile,
    },
  );

  const Seo: NextSeoProps = profile
    ? {
        title: profile.name,
        titleTemplate: '%s | daily.dev',
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

  const [twitterHandle, setTwitterHandle] = useState<string>();
  const [githubHandle, setGithubHandle] = useState<string>();
  const [hashnodeHandle, setHashnodeHandle] = useState<string>();
  const [portfolioLink, setPortfolioLink] = useState<string>();

  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const closeAccountDetails = () => setShowAccountDetails(false);

  useEffect(() => {
    if (profile) {
      const purify = DOMPurify(window);
      setTwitterHandle(sanitizeOrNull(purify, profile.twitter));
      setGithubHandle(sanitizeOrNull(purify, profile.github));
      setHashnodeHandle(sanitizeOrNull(purify, profile.hashnode));
      setPortfolioLink(sanitizeOrNull(purify, profile.portfolio));
    }
  }, [profile]);

  if (isFallback && !initialProfile) {
    return <></>;
  }

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={profile.image} />
      </Head>
      <NextSeo {...Seo} />
      <ResponsivePageContainer className="overflow-x-hidden flex-1 px-6 max-w-full">
        <section
          className={classNames(
            'flex flex-col self-start tablet:flex-row tablet:-ml-4 tablet:-mr-4 tablet:self-stretch tablet:overflow-x-hidden',
            styles.header,
          )}
        >
          <div className="flex tablet:flex-col items-center self-start tablet:px-2 tablet:pt-2 tablet:pb-4 mb-6 tablet:mb-0 rounded-2xl bg-theme-bg-secondary">
            <ProfilePicture user={profile} size="xxxlarge" />
            <div className="flex flex-col tablet:items-center mx-6 tablet:mx-0 tablet:mt-4 typo-footnote">
              <a
                href={reputationGuide}
                target="_blank"
                rel="noopener"
                className="my-0.5 no-underline text-theme-label-tertiary"
              >
                Reputation
              </a>
              <span className="my-0.5 font-bold text-theme-label-primary typo-title1">
                {profile.reputation}
              </span>
            </div>
          </div>
          <div className="flex flex-col tablet:flex-1">
            <div className="flex items-center mb-2">
              <h1 className="m-0 font-bold text-theme-label-primary typo-title3">
                {profile.name}
              </h1>
              {userRank?.userReadingRank?.currentRank > 0 && (
                <Rank
                  rank={userRank.userReadingRank.currentRank}
                  colorByRank
                  data-testid="rank"
                  className="ml-2 w-6 h-6"
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
            <div className={classNames('flex mt-3 mx-0.5', styles.links)}>
              {twitterHandle && (
                <SimpleTooltip content="Twitter">
                  <Button
                    tag="a"
                    href={`https://twitter.com/${twitterHandle}`}
                    target="_blank"
                    rel="noopener"
                    icon={<TwitterIcon />}
                    className="btn-tertiary"
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
                    className="btn-tertiary"
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
                    className="btn-tertiary"
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
                    className="btn-tertiary"
                  >
                    {portfolioLink
                      .replace(/(^\w+:|^)\/\//, '')
                      .replace(/\/?(\?.*)?$/, '')}
                  </QuaternaryButton>
                </SimpleTooltip>
              )}
            </div>
            {profile.id === user?.id && (
              <Button
                className="self-start mt-6 mb-0.5 btn-secondary"
                onClick={() => setShowAccountDetails(true)}
              >
                Account details
              </Button>
            )}
          </div>
        </section>
        <NavBar selectedTab={selectedTab} profile={profile} />
        {children}
      </ResponsivePageContainer>
      {profile.id === user?.id && (windowLoaded || showAccountDetails) && (
        <AccountDetailsModal
          isOpen={showAccountDetails}
          onRequestClose={closeAccountDetails}
        />
      )}
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
    if ('message' in err && err.message === 'not found') {
      return {
        props: { profile: null },
        revalidate: 60,
      };
    }
    throw err;
  }
}
