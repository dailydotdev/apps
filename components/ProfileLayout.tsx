import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import createDOMPurify from 'dompurify';
import { getProfile, getUserProps, PublicProfile } from '../lib/user';
import { NextSeoProps } from 'next-seo/lib/types';
import { getLayout as getMainLayout } from './MainLayout';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import { PageContainer } from './utilities';
import styled from 'styled-components';
import { size05, size2, size3, size4, size6, sizeN } from '../styles/sizes';
import LazyImage from './LazyImage';
import {
  typoDouble,
  typoLil1,
  typoMicro2,
  typoNuggets,
  typoQuarter,
} from '../styles/typography';
import PremiumSvg from './PremiumSvg';
import JoinedDate from './JoinedDate';
import GitHubIcon from '../icons/github.svg';
import TwitterIcon from '../icons/twitter.svg';
import LinkIcon from '../icons/link.svg';
import { colorWater50 } from '../styles/colors';
import { laptop, tablet } from '../styles/media';
import { FloatButton, HollowButton } from './Buttons';
import AuthContext from './AuthContext';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { useHideOnModal } from '../lib/useHideOnModal';
import { useRouter } from 'next/router';
import { Flipped, Flipper } from 'react-flip-toolkit';
import { pageMaxWidth } from '../styles/utilities';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { PageProps } from '../pages/_app';
import { ParsedUrlQuery } from 'querystring';

const AccountDetailsModal = dynamic(() => import('./AccountDetailsModal'));

export interface ProfileLayoutProps {
  profile: PublicProfile;
  children?: ReactNode;
}

const ProfileContainer = styled(PageContainer)`
  padding-left: ${size6};
  padding-right: ${size6};
  color: var(--theme-secondary);
`;

const ProfileImageAndRep = styled.div`
  display: flex;
  margin-bottom: ${size6};
  background: var(--theme-background-highlight);
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
  color: var(--theme-secondary);
  ${typoNuggets}

  & > * {
    margin: ${size05} 0;

    &:last-child {
      color: var(--theme-primary);
      ${typoQuarter}
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
  color: var(--theme-primary);
  ${typoDouble}
`;

const PremiumBadge = styled(PremiumSvg)`
  width: ${sizeN(20)};
  margin-left: ${size3};
`;

const Username = styled.h2`
  margin: 0;
  ${typoMicro2}
`;

const Bio = styled.p`
  margin: ${size3} 0 0;
  word-break: break-word;
  ${typoMicro2}
`;

const JoinedDateStyled = styled(JoinedDate)`
  margin-top: ${size3};
  color: var(--theme-disabled);
  ${typoMicro2}
`;

const Links = styled.div`
  display: flex;
  margin: ${size3} ${sizeN(-2.25)} 0;

  .icon {
    color: var(--theme-secondary);
    font-size: ${size6};
  }

  a {
    display: flex;
    align-items: center;
    margin: 0 ${sizeN(2.25)};
    color: ${colorWater50};
    text-decoration: none;
    ${typoLil1};

    span {
      margin-left: ${size3};
    }
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

const EditProfileButton = styled(HollowButton)`
  margin-top: ${size6};
  padding: ${size2} ${size4};
  border-radius: ${size2};
  align-self: flex-start;
  ${typoNuggets}
`;

const Nav = styled.nav`
  position: relative;
  display: flex;
  margin: ${size6} -${size6} 0;

  :before {
    content: '';
    position: absolute;
    bottom: 0;
    left: -99999px;
    right: -99999px;
    height: 0.063rem;
    width: 100vw;
    margin: 0 auto;
    background: var(--theme-separator);

    ${laptop} {
      width: ${pageMaxWidth};
    }
  }

  li {
    position: relative;
    list-style: none;
  }

  ${FloatButton} {
    padding: ${size4} ${size6};
    ${typoNuggets}

    &.selected {
      color: var(--theme-primary);
    }
  }
`;

const ActiveTabIndicator = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: ${size4};
  height: ${size05};
  margin: 0 auto;
  background: var(--theme-primary);
  border-radius: 0.063rem;
`;

type Tab = { path: string; title: string };

const basePath = `/[userId]`;
const tabs: Tab[] = [
  {
    path: basePath,
    title: 'Comments',
  },
  {
    path: `${basePath}/reputation`,
    title: 'Reputation',
  },
];

export default function ProfileLayout({
  profile: initialProfile,
  children,
}: ProfileLayoutProps): ReactElement {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(
    tabs.findIndex((tab) => tab.path === router?.pathname),
  );

  const profileKey = `/api/v1/users/${initialProfile.id}`;
  const { data: profile } = useSWR<PublicProfile>(profileKey, {
    initialData: initialProfile,
    revalidateOnMount: false,
  });

  const Seo: NextSeoProps = {
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
  };

  const [twitterHandle, setTwitterHandle] = useState<string>();
  const [githubHandle, setGithubHandle] = useState<string>();
  const [portfolioLink, setPortfolioLink] = useState<string>();

  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const closeAccountDetails = async () => {
    setShowAccountDetails(false);
    await mutate(profileKey);
  };

  const getTabHref = (tab: Tab) =>
    tab.path.replace('[userId]', profile.username || profile.id);

  const onTabClicked = async (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    await router.prefetch(getTabHref(tabs[index]));
    setSelectedTab(index);
  };

  const applyPageChange = () => {
    // Add delay to keep the animation at 60fps
    setTimeout(async () => {
      await router.push(getTabHref(tabs[selectedTab]));
    }, 150);
  };

  useEffect(() => {
    const DOMPurify = createDOMPurify(window);
    profile.twitter && setTwitterHandle(DOMPurify.sanitize(profile.twitter));
    profile.github && setGithubHandle(DOMPurify.sanitize(profile.github));
    profile.portfolio &&
      setPortfolioLink(DOMPurify.sanitize(profile.portfolio));
  }, [profile]);

  useHideOnModal(() => !!showAccountDetails, [showAccountDetails]);

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
            />
            <Reputation>
              <span>Reputation</span>
              <span>{profile.reputation}</span>
            </Reputation>
          </ProfileImageAndRep>
          <ProfileInfo>
            <NameAndBadge>
              <Name>{profile.name}</Name>
              {profile.premium && <PremiumBadge />}
            </NameAndBadge>
            {profile.username && <Username>@{profile.username}</Username>}
            {profile.bio && <Bio>{profile.bio}</Bio>}
            <JoinedDateStyled date={new Date(profile.createdAt)} />
            <Links>
              {twitterHandle && (
                <a
                  href={`https://twitter.com/${twitterHandle}`}
                  title="Go to Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TwitterIcon />
                </a>
              )}
              {githubHandle && (
                <a
                  href={`https://github.com/${githubHandle}`}
                  title="Go to GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon />
                </a>
              )}
              {portfolioLink && (
                <a
                  href={portfolioLink}
                  title="Go to portfolio website"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkIcon />
                  <span>{portfolioLink.replace(/(^\w+:|^)\/\//, '')}</span>
                </a>
              )}
            </Links>
            {profile.id === user?.id && (
              <EditProfileButton onClick={() => setShowAccountDetails(true)}>
                Account details
              </EditProfileButton>
            )}
          </ProfileInfo>
        </ProfileHeader>
        <Flipper flipKey={selectedTab} spring="veryGentle">
          <Nav>
            {tabs.map((tab, index) => (
              <li key={tab.path}>
                <FloatButton
                  as="a"
                  href={getTabHref(tab)}
                  className={selectedTab === index ? 'selected' : ''}
                  onClick={(event: React.MouseEvent) =>
                    onTabClicked(event, index)
                  }
                >
                  {tab.title}
                </FloatButton>
                <Flipped flipId="activeTabIndicator" onStart={applyPageChange}>
                  {selectedTab === index && <ActiveTabIndicator />}
                </Flipped>
              </li>
            ))}
          </Nav>
        </Flipper>
        {children}
      </ProfileContainer>
      {user && (
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

export async function getServerSideProps({
  params,
  req,
  res,
}: GetServerSidePropsContext<ProfileParams>): Promise<
  GetServerSidePropsResult<Omit<ProfileLayoutProps, 'children'> & PageProps>
> {
  const { userId } = params;
  try {
    const [profile, userProps] = await Promise.all([
      getProfile(userId),
      getUserProps({ req, res }),
    ]);
    return {
      props: {
        profile,
        initialApolloState: null,
        ...userProps,
      },
    };
  } catch (err) {
    if ('message' in err && err.message === 'not found') {
      res.writeHead(302, { Location: '/404' });
      res.end();
    } else {
      throw err;
    }
    return {
      props: null,
    };
  }
}
