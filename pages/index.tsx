import React, { ReactElement } from 'react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getUser, LoggedUser } from '../lib/user';
import { PageProps } from './_app';
import MainLayout from '../components/MainLayout';
import styled from 'styled-components';
import { size4, size6, sizeN } from '../styles/sizes';
import { typoJr, typoQuarter } from '../styles/typography';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { InvertButton } from '../components/Buttons';
import { laptop } from '../styles/media';

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<PageProps>> {
  const userRes = await getUser({ req, res });
  return {
    props: {
      initialApolloState: null,
      user: userRes.isLoggedIn ? (userRes.user as LoggedUser) : null,
      trackingId: userRes.user.id,
    },
  };
}

const Container = styled.div`
  display: flex;
  max-width: ${sizeN(144)};
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: ${size6};

  ${laptop} {
    height: 100vh;
    justify-content: center;
  }
`;

const Emoji = styled.div`
  font-size: ${sizeN(30)};
`;

const Title = styled.h1`
  margin: ${size6} 0 ${size4};
  text-align: center;
  ${typoQuarter}
`;

const Description = styled.div`
  margin-bottom: ${size6};
  color: var(--theme-secondary);
  text-align: center;
  ${typoJr}
`;

export default function Home(): ReactElement {
  const Seo: NextSeoProps = {
    title: 'daily.dev',
    titleTemplate: '%s',
    description: 'Source for busy developers',
  };

  return (
    <MainLayout>
      <Container>
        <NextSeo {...Seo} />
        <Emoji>🏗</Emoji>
        <Title>Something awesome is coming soon 👨‍💻</Title>
        <Description>
          You requested, we listened. We’re busy building a new web app for
          daily.dev. We wish we could show you more! In the meantime, you can
          explore the latest dev news on our browser extension (if you don’t
          have it already).
        </Description>
        <InvertButton as="a" href="/api/get?r=webapp">
          Get the extension
        </InvertButton>
      </Container>
    </MainLayout>
  );
}
