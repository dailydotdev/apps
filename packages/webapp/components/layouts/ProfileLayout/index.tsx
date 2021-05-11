import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import createDOMPurify from 'dompurify';
import { getProfile, getProfileSSR, PublicProfile } from '../../../lib/user';
import { NextSeoProps } from 'next-seo/lib/types';
import { getLayout as getMainLayout } from '../MainLayout';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import styled from '@emotion/styled';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import {
  typoCallout,
  typoFootnote,
  typoTitle1,
  typoTitle3,
} from '../../../styles/typography';
import JoinedDate from '../../profile/JoinedDate';
import GitHubIcon from '@dailydotdev/shared/icons/github.svg';
import TwitterIcon from '@dailydotdev/shared/icons/twitter.svg';
import HashnodeIcon from '@dailydotdev/shared/icons/hashnode.svg';
import LinkIcon from '@dailydotdev/shared/icons/link.svg';
import { tablet } from '../../../styles/media';
import AuthContext from '../../../contexts/AuthContext';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { reputationGuide } from '../../../lib/constants';
import { useQuery } from 'react-query';
import Rank from '../../Rank';
import request from 'graphql-request';
import { apiUrl } from '../../../lib/config';
import {
  USER_READING_RANK_QUERY,
  UserReadingRankData,
} from '../../../graphql/users';
import NavBar, { tabs } from './NavBar';
import ProgressiveEnhancementContext from '../../../contexts/ProgressiveEnhancementContext';
import {
  LazyImage,
  ResponsivePageContainer,
  Button,
  QuaternaryButton,
  getTooltipProps,
} from '@dailydotdev/shared';

const AccountDetailsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal" */ '../../modals/AccountDetailsModal'
    ),
);
const Custom404 = dynamic(() => import('../../../pages/404'));

export interface ProfileLayoutProps {
  profile: PublicProfile;
  children?: ReactNode;
}

const ProfileContainer = styled(ResponsivePageContainer)`
  padding-left: ${sizeN(6)};
  padding-right: ${sizeN(6)};
`;

const ProfileImageAndRep = styled.div`
  display: flex;
  margin-bottom: ${sizeN(6)};
  background: var(--theme-background-secondary);
  border-radius: ${sizeN(4)};
  align-self: flex-start;
  align-items: center;

  ${tablet} {
    flex-direction: column;
    margin-bottom: 0;
    padding: ${sizeN(2)} ${sizeN(2)} ${sizeN(4)};
  }
`;

const ProfileImage = styled(LazyImage)`
  width: ${sizeN(25)};
  border-radius: ${sizeN(4)};
`;

const Reputation = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 ${sizeN(6)};
  ${typoFootnote}

  a {
    color: var(--theme-label-tertiary);
    text-decoration: none;
  }

  & > * {
    margin: ${sizeN(0.5)} 0;

    &:last-child {
      color: var(--theme-label-primary);
      font-weight: bold;
      ${typoTitle1}
    }
  }

  ${tablet} {
    align-items: center;
    margin: ${sizeN(4)} 0 0;
  }
`;

const NameAndBadge = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${sizeN(2)};
`;

const Name = styled.h1`
  margin: 0;
  color: var(--theme-label-primary);
  font-weight: bold;
  ${typoTitle3}
`;

const StyledRank = styled(Rank)`
  width: ${sizeN(6)};
  height: ${sizeN(6)};
  margin-left: ${sizeN(2)};
`;

const Username = styled.h2`
  margin: 0;
  font-weight: normal;
  color: var(--theme-label-secondary);
  ${typoCallout}
`;

const Bio = styled.p`
  margin: ${sizeN(3)} 0 0;
  color: var(--theme-label-tertiary);
  word-break: break-word;
  ${typoCallout}
`;

const JoinedDateStyled = styled(JoinedDate)`
  margin-top: ${sizeN(3)};
  color: var(--theme-label-quaternary);
  ${typoFootnote}
`;

const Links = styled.div`
  display: flex;
  margin: ${sizeN(3)} ${sizeN(0.5)} 0;

  > * {
    margin: 0 ${sizeN(0.5)};
  }

  label {
    color: var(--theme-label-link);
  }
`;

const ProfileHeader = styled.section`
  display: flex;
  flex-direction: column;
  align-self: flex-start;

  ${tablet} {
    flex-direction: row;
    margin-left: -${sizeN(4)};
    margin-right: -${sizeN(4)};
    align-self: stretch;
    overflow-x: hidden;

    & > * {
      margin-left: ${sizeN(4)};
      margin-right: ${sizeN(4)};
    }
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;

  ${tablet} {
    flex: 1;
  }
`;

const EditProfileButton = styled(Button)`
  margin-top: ${sizeN(6)};
  margin-bottom: 2px;
  align-self: flex-start;
`;

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
      const DOMPurify = createDOMPurify(window);
      profile.twitter && setTwitterHandle(DOMPurify.sanitize(profile.twitter));
      profile.github && setGithubHandle(DOMPurify.sanitize(profile.github));
      profile.hashnode &&
        setHashnodeHandle(DOMPurify.sanitize(profile.hashnode));
      profile.portfolio &&
        setPortfolioLink(DOMPurify.sanitize(profile.portfolio));
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
      <ProfileContainer>
        <ProfileHeader>
          <ProfileImageAndRep>
            <ProfileImage
              imgSrc={profile.image}
              imgAlt={`${profile.name}'s profile image`}
              eager={true}
              ratio="100%"
            />
            <Reputation>
              <a href={reputationGuide} target="_blank" rel="noopener">
                Reputation
              </a>
              <span>{profile.reputation}</span>
            </Reputation>
          </ProfileImageAndRep>
          <ProfileInfo>
            <NameAndBadge>
              <Name>{profile.name}</Name>
              {userRank?.userReadingRank?.currentRank > 0 && (
                <StyledRank
                  rank={userRank.userReadingRank.currentRank}
                  colorByRank
                  data-testid="rank"
                />
              )}
            </NameAndBadge>
            {profile.username && <Username>@{profile.username}</Username>}
            {profile.bio && <Bio>{profile.bio}</Bio>}
            <JoinedDateStyled date={new Date(profile.createdAt)} />
            <Links>
              {twitterHandle && (
                <Button
                  tag="a"
                  href={`https://twitter.com/${twitterHandle}`}
                  {...getTooltipProps('Twitter')}
                  target="_blank"
                  rel="noopener"
                  icon={<TwitterIcon />}
                  className="btn-tertiary"
                />
              )}
              {githubHandle && (
                <Button
                  tag="a"
                  href={`https://github.com/${githubHandle}`}
                  {...getTooltipProps('GitHub')}
                  target="_blank"
                  rel="noopener"
                  icon={<GitHubIcon />}
                  className="btn-tertiary"
                />
              )}
              {hashnodeHandle && (
                <Button
                  tag="a"
                  href={`https://hashnode.com/@${hashnodeHandle}`}
                  {...getTooltipProps('Hashnode')}
                  target="_blank"
                  rel="noopener"
                  icon={<HashnodeIcon />}
                  className="btn-tertiary"
                />
              )}
              {portfolioLink && (
                <QuaternaryButton
                  tag="a"
                  id="portfolio-link"
                  href={portfolioLink}
                  {...getTooltipProps('Portfolio')}
                  target="_blank"
                  rel="noopener"
                  icon={<LinkIcon />}
                  className="btn-tertiary"
                >
                  {portfolioLink
                    .replace(/(^\w+:|^)\/\//, '')
                    .replace(/\/?(\?.*)?$/, '')}
                </QuaternaryButton>
              )}
            </Links>
            {profile.id === user?.id && (
              <EditProfileButton
                className="btn-secondary"
                onClick={() => setShowAccountDetails(true)}
              >
                Account details
              </EditProfileButton>
            )}
          </ProfileInfo>
        </ProfileHeader>
        <NavBar selectedTab={selectedTab} profile={profile} />
        {children}
      </ProfileContainer>
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
  getMainLayout(<ProfileLayout {...props}>{page}</ProfileLayout>, null, {
    responsive: false,
  });

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
    } else {
      throw err;
    }
  }
}
