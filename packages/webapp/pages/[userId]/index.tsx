import React, { ReactElement } from 'react';
import {
  ProfileLayoutProps,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  getLayout as getProfileLayout,
} from '../../components/layouts/ProfileLayout/v2';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfilePage = ({ profile }: ProfileLayoutProps): ReactElement => {
  return <></>;
};

ProfilePage.getLayout = getProfileLayout;
export default ProfilePage;
