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
const ProfilePostsPage = ({ profile }: ProfileLayoutProps): ReactElement => {
  return <></>;
};

ProfilePostsPage.getLayout = getProfileLayout;
export default ProfilePostsPage;
