import React, { ReactElement } from 'react';
import styled from 'styled-components';
import UpvoteIcon from '../icons/upvote.svg';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import TertiaryButton from '../components/buttons/TertiaryButton';
import QuandaryButton from '../components/buttons/QuandaryButton';
import { ColorName } from '../styles/colors';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 4rem;

  & > * {
    margin: 1rem;
  }
`;

const Page = (): ReactElement => {
  const color: ColorName = 'bacon';
  return (
    <Container>
      <PrimaryButton color={color} icon={<UpvoteIcon />}>
        My Button
      </PrimaryButton>
      <SecondaryButton color={color} icon={<UpvoteIcon />}>
        My Button
      </SecondaryButton>
      <TertiaryButton color={color} icon={<UpvoteIcon />}>
        My Button
      </TertiaryButton>
      <QuandaryButton id="button" color={color} icon={<UpvoteIcon />}>
        My Button
      </QuandaryButton>
    </Container>
  );
};

export default Page;
