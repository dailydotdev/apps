import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import GoBackHeaderMobile from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import { ProfileSegment } from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { ProfileFeedPane } from '../../components/profile/ProfileFeedPane';
import { ProfilePage } from '../../components/profile/ProfilePage';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfilePostsPage = (props: ProfileLayoutProps): ReactElement | null => {
  const { user, noindex } = props;
  const isPhone = useIsPhone();

  if (!user) {
    return null;
  }

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(
      user,
      {
        ...getPageSeoTitles(`Recent posts by ${user.name} (@${user.username})`),
        noindex: true,
        nofollow: true,
      },
      noindex,
    ),
  };

  if (isPhone) {
    return <ProfilePage {...props} active={ProfileSegment.Posts} seo={seo} />;
  }

  return (
    <>
      <NextSeo {...seo} />
      <GoBackHeaderMobile title="Posts" />
      <ProfileFeedPane user={user} segment={ProfileSegment.Posts} />
    </>
  );
};

ProfilePostsPage.getLayout = getProfileLayout;
export default ProfilePostsPage;
