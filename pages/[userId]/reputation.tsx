import React, { ReactElement } from 'react';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import styled from 'styled-components';
import { size6 } from '../../styles/sizes';
import { typoMicro2 } from '../../styles/typography';
import { reputationGuide } from '../../lib/constants';
import { colorWater50 } from '../../styles/colors';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const Container = styled.section`
  margin: ${size6} 0;
  ${typoMicro2}

  a {
    color: ${colorWater50};
    text-decoration: none;
  }
`;

const ProfilePage = (): ReactElement => {
  return (
    <Container>
      Earning reputation points will allow you to gain special privileges
      (coming soon).
      <br />
      <br />
      In the meantime,{' '}
      <a href={reputationGuide} target="_blank" rel="noopener noreferrer">
        learn how to earn reputation points.
      </a>
    </Container>
  );
};

ProfilePage.getLayout = getProfileLayout;

export default ProfilePage;
