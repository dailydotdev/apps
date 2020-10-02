import React, { ReactElement } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { typoQuarter } from '../styles/typography';
import { size10, size9 } from '../styles/sizes';
import HelloWorldSvg from '../components/svg/HelloWorldSvg';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const Heading = styled.h1`
  margin: 0 ${size9};
  text-align: center;
  word-break: break-word;
  text-transform: uppercase;
  ${typoQuarter}
`;

const Art = styled(HelloWorldSvg)`
  width: 55%;
  max-width: 32.75rem;
  margin: 0 0 ${size10};
  align-self: center;
`;

export default function Custom404(): ReactElement {
  return (
    <Container>
      <Head>
        <title>Page not found 😅</title>
      </Head>
      <Art />
      <Heading>Oops, this page couldn’t be found</Heading>
    </Container>
  );
}
