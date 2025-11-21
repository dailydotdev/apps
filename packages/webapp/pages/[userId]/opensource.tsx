import type { ReactElement } from 'react';
import React from 'react';
import { useProfileExperiences } from '@dailydotdev/shared/src/features/profile/hooks/useProfileExperiences';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { ProfileExperienceDetailPage } from '../../components/layouts/ProfileLayout/ProfileExperienceDetailPage';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const OpensourcePage = ({
  user,
  noindex,
}: ProfileLayoutProps): ReactElement => {
  const { opensource } = useProfileExperiences(user);

  return (
    <ProfileExperienceDetailPage
      user={user}
      noindex={noindex}
      experiences={opensource}
      title="Open Source"
      seoTitle={`Open source contributions for ${user.name} (@${user.username})`}
    />
  );
};

OpensourcePage.getLayout = getProfileLayout;
export default OpensourcePage;
