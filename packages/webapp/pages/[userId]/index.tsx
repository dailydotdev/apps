import type { ReactElement } from 'react';
import React from 'react';
import { ProfilePage } from '../../components/profile/ProfilePage';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';

const ProfileIndexPage = (props: ProfileLayoutProps): ReactElement => (
  <ProfilePage {...props} />
);

ProfileIndexPage.getLayout = getProfileLayout;
export default ProfileIndexPage;

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;
