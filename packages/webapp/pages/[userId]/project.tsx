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

const ProjectsPage = ({ user, noindex }: ProfileLayoutProps): ReactElement => {
  const { project } = useProfileExperiences(user);

  return (
    <ProfileExperienceDetailPage
      user={user}
      noindex={noindex}
      experiences={project}
      title="Projects"
      seoTitle={`Projects for ${user.name} (@${user.username})`}
    />
  );
};

ProjectsPage.getLayout = getProfileLayout;
export default ProjectsPage;
