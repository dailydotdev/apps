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
import { ProfileRepliesFeed } from '../../components/layouts/ProfileLayout/ProfileFeeds';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const ProfileCommentsPage = (
  props: ProfileLayoutProps,
): ReactElement | null => (
  <ProfileSegmentPage
    {...props}
    segment={ProfileSegment.Replies}
    title="Replies"
    feed={ProfileRepliesFeed}
  />
);

ProfileCommentsPage.getLayout = getProfileLayout;
export default ProfileCommentsPage;
