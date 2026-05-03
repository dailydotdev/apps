import type { ReactElement } from 'react';
import React from 'react';
import {
  ButtonV2,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import type { NextSeoProps } from 'next-seo';
import { UserExperienceType } from '@dailydotdev/shared/src/graphql/user/profile';
import { ExperienceSettings } from '@dailydotdev/shared/src/components/profile/ExperienceSettings';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getPageSeoTitles } from '../../../../components/layouts/utils';
import { defaultSeo } from '../../../../next-seo';
import { getSettingsLayout } from '../../../../components/layouts/SettingsLayout';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Projects & Publications'),
};

const ProjectsPage = (): ReactElement => {
  return (
    <AccountPageContainer
      title="Projects & Publications"
      actions={
        <Link
          href={`${webappUrl}settings/profile/experience/edit?type=${UserExperienceType.Project}`}
        >
          <ButtonV2
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
          >
            Add
          </ButtonV2>
        </Link>
      }
    >
      <ExperienceSettings
        experienceType={UserExperienceType.Project}
        emptyStateMessage="No projects added yet"
      />
    </AccountPageContainer>
  );
};

ProjectsPage.getLayout = getSettingsLayout;
ProjectsPage.layoutProps = { seo };

export default ProjectsPage;
