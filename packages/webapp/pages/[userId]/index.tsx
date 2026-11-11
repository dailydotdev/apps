import type { ReactElement } from 'react';
import React from 'react';
import { ProfileSegment } from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import { ProfilePage } from '../../components/layouts/ProfileLayout/ProfilePage';

const ProfileIndexPage = (props: ProfileLayoutProps): ReactElement => (
  <ProfilePage {...props} segment={ProfileSegment.About} />
);

ProfileIndexPage.getLayout = getProfileLayout;
export default ProfileIndexPage;

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;
