import React, { ReactElement } from 'react';
import {
  getLayout as getProfileLayout,
  getServerSideProps as getProfileServerSideProps,
} from '../../components/ProfileLayout';
import styled from 'styled-components';
import { size6 } from '../../styles/sizes';
import { typoMicro2 } from '../../styles/typography';

export const getServerSideProps = getProfileServerSideProps;

const Container = styled.section`
  content-visibility: auto;
  margin: ${size6} 0;
  ${typoMicro2}
`;

const ProfilePage = (): ReactElement => {
  return (
    <Container>
      Earning reputation points will allow you to gain special privileges
      (coming soon).
    </Container>
  );
};

ProfilePage.getLayout = getProfileLayout;

export default ProfilePage;
