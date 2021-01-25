import React, { ReactElement } from 'react';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import styled from '@emotion/styled';
import { size6 } from '../../styles/sizes';
import { typoCallout } from '../../styles/typography';
import { reputationGuide } from '../../lib/constants';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const Container = styled.section`
  margin: ${size6} 0;
  ${typoCallout}

  a {
    color: var(--theme-label-link);
    text-decoration: none;
  }
`;

const ProfilePage = (): ReactElement => {
  return (
    <Container>
      Earning reputation points will allow you to gain special privileges
      (coming soon).
      <br />
      In the meantime,{' '}
      <a href={reputationGuide} target="_blank" rel="noopener">
        learn how to earn reputation points.
      </a>
    </Container>
  );
};

ProfilePage.getLayout = getProfileLayout;

export default ProfilePage;
