import type { ReactElement } from 'react';
import React from 'react';
import { ProfileSegment } from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { ProfileSegmentPage } from '../../components/layouts/ProfileLayout/ProfileSegmentPage';
import { ProfilePostsFeed } from '../../components/layouts/ProfileLayout/ProfileFeeds';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const ProfilePostsPage = (props: ProfileLayoutProps): ReactElement | null => (
  <ProfileSegmentPage
    {...props}
    segment={ProfileSegment.Posts}
    title="Posts"
    feed={ProfilePostsFeed}
  />
);

ProfilePostsPage.getLayout = getProfileLayout;
export default ProfilePostsPage;
