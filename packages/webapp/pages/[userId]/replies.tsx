import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import GoBackHeaderMobile from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import { ProfileSegment } from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
} from '../../components/layouts/ProfileLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { ProfileFeedPane } from '../../components/profile/ProfileFeedPane';
import { ProfilePage } from './index';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfileCommentsPage = (
  props: ProfileLayoutProps,
): ReactElement | null => {
  const { user, noindex } = props;
  const isPhone = useIsPhone();

  if (!user) {
    return null;
  }

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(
      user,
      {
        ...getPageSeoTitles(
          `Posts with replies by ${user.name} (@${user.username})`,
        ),
        noindex: true,
        nofollow: true,
      },
      noindex,
    ),
  };

  if (isPhone) {
    return <ProfilePage {...props} active={ProfileSegment.Replies} seo={seo} />;
  }

  return (
    <>
      <NextSeo {...seo} />
      <GoBackHeaderMobile title="Replies" />
      <ProfileFeedPane user={user} segment={ProfileSegment.Replies} />
    </>
  );
};

ProfileCommentsPage.getLayout = getProfileLayout;
export default ProfileCommentsPage;
