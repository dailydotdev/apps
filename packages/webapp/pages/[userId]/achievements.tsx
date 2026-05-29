import type { ReactElement } from 'react';
import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import GoBackHeaderMobile from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ProfileAchievements } from '@dailydotdev/shared/src/features/profile/components/achievements/ProfileAchievements';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const ProfileAchievementsPage = ({
  user,
  noindex,
}: ProfileLayoutProps): ReactElement | null => {
  const { user: loggedUser } = useContext(AuthContext);
  const { optOutAchievements } = useSettingsContext();
  const router = useRouter();
  const isSameUser = user && loggedUser?.id === user.id;

  useEffect(() => {
    if (optOutAchievements && user?.username) {
      router.replace(`/${user.username}`);
    }
  }, [optOutAchievements, user?.username, router]);

  if (optOutAchievements || !user) {
    return null;
  }

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(
      user,
      {
        ...getPageSeoTitles(`Achievements by ${user.name} (@${user.username})`),
        description: `View ${
          isSameUser ? 'your' : `${user.name}'s`
        } achievements on daily.dev`,
        noindex: true,
        nofollow: true,
      },
      noindex,
    ),
  };

  return (
    <>
      <NextSeo {...seo} />
      <GoBackHeaderMobile>
        <Typography bold type={TypographyType.Body}>
          Achievements
        </Typography>
      </GoBackHeaderMobile>
      <div className="p-6">
        <ProfileAchievements user={user} />
      </div>
    </>
  );
};

ProfileAchievementsPage.getLayout = getProfileLayout;
export default ProfileAchievementsPage;
