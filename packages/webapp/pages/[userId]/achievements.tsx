import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import GoBackHeaderMobile from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ProfileAchievements } from '@dailydotdev/shared/src/features/profile/components/achievements/ProfileAchievements';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { getTemplatedTitle } from '../../components/layouts/utils';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const ProfileAchievementsPage = ({
  user,
  noindex,
}: ProfileLayoutProps): ReactElement => {
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = user && loggedUser?.id === user.id;

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(
      user,
      {
        title: getTemplatedTitle(
          `Achievements by ${user.name} (@${user.username})`,
        ),
        description: `View ${
          isSameUser ? 'your' : `${user.name}'s`
        } achievements on daily.dev`,
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
