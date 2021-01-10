import React, { ReactElement } from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
  LoadingButton,
} from '../components/buttons';
import styled from 'styled-components';

const Container = styled.div`
  margin: 4rem;

  & > * {
    margin: 1rem;
  }
`;

const Page = (): ReactElement => {
  return (
    <Container>
      <LoadingButton type={PrimaryButton}>My Button</LoadingButton>
      <PrimaryButton>My Button</PrimaryButton>
      <SecondaryButton>My Button</SecondaryButton>
      <TertiaryButton>My Button</TertiaryButton>
    </Container>
  );
};

export default Page;
