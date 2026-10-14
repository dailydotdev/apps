import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import GoBackHeaderMobile from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import {
  ProfileSegment,
  ProfileSegments,
} from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { ProfilePostsFeed } from '../../components/profile/ProfilePostsFeed';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfilePostsPage = ({
  user,
  noindex,
}: ProfileLayoutProps): ReactElement | null => {
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

  return (
    <>
      <NextSeo {...seo} />
      {isPhone ? (
        <ShellPage
          title={user.name}
          row={<ProfileSegments user={user} active={ProfileSegment.Posts} />}
        />
      ) : (
        <GoBackHeaderMobile title="Posts" />
      )}
      <ProfilePostsFeed user={user} />
    </>
  );
};

ProfilePostsPage.getLayout = getProfileLayout;
export default ProfilePostsPage;
