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
import { PageContainer } from '../../utilities';
import styled from 'styled-components';
import {
  size05,
  size2,
  size3,
  size4,
  size6,
  sizeN,
} from '../../../styles/sizes';
import LazyImage from '../../LazyImage';
import {
  typoCallout,
  typoFootnote,
  typoTitle1,
  typoTitle3,
} from '../../../styles/typography';
import JoinedDate from '../../profile/JoinedDate';
import GitHubIcon from '../../../icons/github.svg';
import TwitterIcon from '../../../icons/twitter.svg';
import HashnodeIcon from '../../../icons/hashnode.svg';
import LinkIcon from '../../../icons/link.svg';
import { tablet } from '../../../styles/media';
import AuthContext from '../../AuthContext';
import dynamic from 'next/dynamic';
import { useHideOnModal } from '../../../lib/useHideOnModal';
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
import dynamicPageLoad from '../../../lib/dynamicPageLoad';
import NavBar, { tabs } from './NavBar';
import TertiaryButton from '../../buttons/TertiaryButton';
import QuandaryButton from '../../buttons/QuandaryButton';
import SecondaryButton from '../../buttons/SecondaryButton';

const AccountDetailsModal = dynamicPageLoad(
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

const ProfileContainer = styled(PageContainer)`
  padding-left: ${size6};
  padding-right: ${size6};
`;

const ProfileImageAndRep = styled.div`
  display: flex;
  margin-bottom: ${size6};
  background: var(--theme-background-secondary);
  border-radius: ${size4};
  align-self: flex-start;
  align-items: center;

  ${tablet} {
    flex-direction: column;
    margin-bottom: 0;
    padding: ${size2} ${size2} ${size4};
  }
`;

const ProfileImage = styled(LazyImage).attrs({ ratio: '100%' })`
  width: ${sizeN(25)};
  border-radius: ${size4};
`;

const Reputation = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 ${size6};
  ${typoFootnote}

  a {
    color: var(--theme-label-tertiary);
    text-decoration: none;
  }

  & > * {
    margin: ${size05} 0;

    &:last-child {
      color: var(--theme-label-primary);
      font-weight: bold;
      ${typoTitle1}
    }
  }

  ${tablet} {
    align-items: center;
    margin: ${size4} 0 0;
  }
`;

const NameAndBadge = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${size2};
`;

const Name = styled.h1`
  margin: 0;
  color: var(--theme-label-primary);
  font-weight: bold;
  ${typoTitle3}
`;

const StyledRank = styled(Rank)`
  width: ${size6};
  height: ${size6};
  margin-left: ${size2};
`;

const Username = styled.h2`
  margin: 0;
  font-weight: normal;
  color: var(--theme-label-secondary);
  ${typoCallout}
`;

const Bio = styled.p`
  margin: ${size3} 0 0;
  color: var(--theme-label-tertiary);
  word-break: break-word;
  ${typoCallout}
`;

const JoinedDateStyled = styled(JoinedDate)`
  margin-top: ${size3};
  color: var(--theme-label-quaternary);
  ${typoFootnote}
`;

const Links = styled.div`
  display: flex;
  margin: ${size3} ${size05} 0;

  > * {
    margin: 0 ${size05};
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
    margin-left: -${size4};
    margin-right: -${size4};
    align-self: stretch;
    overflow-x: hidden;

    & > * {
      margin-left: ${size4};
      margin-right: ${size4};
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

const EditProfileButton = styled(SecondaryButton)`
  margin-top: ${size6};
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

  const { user } = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState(
    tabs.findIndex((tab) => tab.path === router?.pathname),
  );
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

  useHideOnModal(() => !!showAccountDetails, [showAccountDetails]);

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
                  data-testid="rank"
                />
              )}
            </NameAndBadge>
            {profile.username && <Username>@{profile.username}</Username>}
            {profile.bio && <Bio>{profile.bio}</Bio>}
            <JoinedDateStyled date={new Date(profile.createdAt)} />
            <Links>
              {twitterHandle && (
                <TertiaryButton
                  tag="a"
                  href={`https://twitter.com/${twitterHandle}`}
                  title="Go to Twitter"
                  target="_blank"
                  rel="noopener"
                  icon={<TwitterIcon />}
                />
              )}
              {githubHandle && (
                <TertiaryButton
                  tag="a"
                  href={`https://github.com/${githubHandle}`}
                  title="Go to GitHub"
                  target="_blank"
                  rel="noopener"
                  icon={<GitHubIcon />}
                />
              )}
              {hashnodeHandle && (
                <TertiaryButton
                  tag="a"
                  href={`https://hashnode.com/@${hashnodeHandle}`}
                  title="Go to Hashnode"
                  target="_blank"
                  rel="noopener"
                  icon={<HashnodeIcon />}
                />
              )}
              {portfolioLink && (
                <QuandaryButton
                  id="portfolio-link"
                  href={portfolioLink}
                  title="Go to portfolio website"
                  target="_blank"
                  rel="noopener"
                  icon={<LinkIcon />}
                >
                  {portfolioLink
                    .replace(/(^\w+:|^)\/\//, '')
                    .replace(/\/?(\?.*)?$/, '')}
                </QuandaryButton>
              )}
            </Links>
            {profile.id === user?.id && (
              <EditProfileButton onClick={() => setShowAccountDetails(true)}>
                Account details
              </EditProfileButton>
            )}
          </ProfileInfo>
        </ProfileHeader>
        <NavBar
          selectedTab={selectedTab}
          profile={profile}
          onTabSelected={setSelectedTab}
          router={router}
        />
        {children}
      </ProfileContainer>
      {profile.id === user?.id && (
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
): ReactNode => getMainLayout(<ProfileLayout {...props}>{page}</ProfileLayout>);

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
