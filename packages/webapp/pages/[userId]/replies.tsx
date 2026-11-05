import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import GoBackHeaderMobile from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import { ProfileSegment } from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getLayout as getProfileLayout,
  getProfileSegmentSeo,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { ProfilePage } from '../../components/layouts/ProfileLayout/ProfilePage';
import { ProfileRepliesFeed } from '../../components/layouts/ProfileLayout/ProfileFeeds';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const ProfileCommentsPage = (
  props: ProfileLayoutProps,
): ReactElement | null => {
  const { user, noindex } = props;
  const isPhone = useIsPhone();

  if (!user) {
    return null;
  }

  if (isPhone) {
    return <ProfilePage {...props} segment={ProfileSegment.Replies} />;
  }

  return (
    <>
      <NextSeo
        {...getProfileSegmentSeo(user, ProfileSegment.Replies, noindex)}
      />
      <GoBackHeaderMobile title="Replies" />
      <ProfileRepliesFeed user={user} />
    </>
  );
};

ProfileCommentsPage.getLayout = getProfileLayout;
export default ProfileCommentsPage;
