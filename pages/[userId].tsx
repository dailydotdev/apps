import React, { ReactElement, useEffect, useState } from 'react';
import { PageProps } from './_app';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import createDOMPurify from 'dompurify';
import { getProfile, getUserProps, PublicProfile } from '../lib/user';
import { NextSeoProps } from 'next-seo/lib/types';
import MainLayout from '../components/MainLayout';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import { PageContainer } from '../components/utilities';
import styled from 'styled-components';
import { size05, size2, size3, size4, size6, sizeN } from '../styles/sizes';
import LazyImage from '../components/LazyImage';
import {
  typoDouble,
  typoLil1,
  typoMicro2,
  typoNuggets,
  typoQuarter,
} from '../styles/typography';
import PremiumSvg from '../components/PremiumSvg';
import JoinedDate from '../components/JoinedDate';
import GitHubIcon from '../icons/github.svg';
import TwitterIcon from '../icons/twitter.svg';
import LinkIcon from '../icons/link.svg';
import { colorWater50 } from '../styles/colors';
import { tablet } from '../styles/media';

export interface Props {
  profile: PublicProfile;
}

interface ProfileParams extends ParsedUrlQuery {
  userId: string;
}

export async function getServerSideProps({
  params,
  req,
  res,
}: GetServerSidePropsContext<ProfileParams>): Promise<
  GetServerSidePropsResult<Props & PageProps>
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

const ProfileContainer = styled(PageContainer)`
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
`;

export default function ProfilePage({ profile }: Props): ReactElement {
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

  useEffect(() => {
    const DOMPurify = createDOMPurify(window);
    profile.twitter && setTwitterHandle(DOMPurify.sanitize(profile.twitter));
    profile.github && setGithubHandle(DOMPurify.sanitize(profile.github));
    profile.portfolio &&
      setPortfolioLink(DOMPurify.sanitize(profile.portfolio));
  }, []);

  return (
    <MainLayout>
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
          </ProfileInfo>
        </ProfileHeader>
      </ProfileContainer>
    </MainLayout>
  );
}
