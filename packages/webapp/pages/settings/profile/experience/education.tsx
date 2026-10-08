import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import type { NextSeoProps } from 'next-seo';
import { UserExperienceType } from '@dailydotdev/shared/src/graphql/user/profile';
import { ExperienceSettings } from '@dailydotdev/shared/src/components/profile/ExperienceSettings';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getPageSeoTitles } from '../../../../components/layouts/utils';
import { defaultSeo, noindexSeoProps } from '../../../../next-seo';
import { getSettingsLayout } from '../../../../components/layouts/SettingsLayout';
import {
  AccountPageAddSquare,
  AccountPageContainer,
} from '../../../../components/layouts/SettingsLayout/AccountPageContainer';

const addUrl = `${webappUrl}settings/profile/experience/edit?type=${UserExperienceType.Education}`;

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Education'),
  ...noindexSeoProps,
};

const EducationPage = (): ReactElement => {
  return (
    <AccountPageContainer
      title="Education"
      phoneActions={
        <AccountPageAddSquare href={addUrl} label="Add education" />
      }
      actions={
        <Link href={addUrl}>
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
          >
            Add
          </Button>
        </Link>
      }
    >
      <ExperienceSettings
        experienceType={UserExperienceType.Education}
        emptyStateMessage="No education added yet"
      />
    </AccountPageContainer>
  );
};

EducationPage.getLayout = getSettingsLayout;
EducationPage.layoutProps = { seo };

export default EducationPage;
