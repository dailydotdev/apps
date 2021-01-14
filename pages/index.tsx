import React, { ReactElement } from 'react';
import { getLayout as getMainLayout } from '../components/layouts/MainLayout';
import styled from 'styled-components';
import { size4, size6, sizeN } from '../styles/sizes';
import { typoBody, typoTitle1 } from '../styles/typography';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import { laptop } from '../styles/media';
import PrimaryButton from '../components/buttons/PrimaryButton';

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
  font-weight: bold;
  ${typoTitle1}
`;

const Description = styled.div`
  margin-bottom: ${size6};
  color: var(--theme-label-secondary);
  text-align: center;
  ${typoBody}
`;

const Home = (): ReactElement => {
  const Seo: NextSeoProps = {
    title:
      'Meet awesome developers by discussing trending dev news | powered by the daily.dev community',
    titleTemplate: '%s',
    description:
      'Join the live discussion about the latest programming articles. It’s a place for developers to create meaningful interactions and help each other learn  cool things.',
  };

  return (
    <Container>
      <NextSeo {...Seo} />
      <Emoji>🏗</Emoji>
      <Title>Something awesome is coming soon 👨‍💻</Title>
      <Description>
        You requested, we listened. We’re busy building a new web app for
        daily.dev. We wish we could show you more! In the meantime, you can
        explore the latest dev news on our browser extension (if you don’t have
        it already).
      </Description>
      <PrimaryButton tag="a" href="/api/get?r=webapp">
        Get the extension
      </PrimaryButton>
    </Container>
  );
};

Home.getLayout = getMainLayout;

export default Home;
