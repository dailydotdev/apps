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
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { defaultSeo } from '../../../../next-seo';
import { getSettingsLayout } from '../../../../components/layouts/SettingsLayout';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Volunteering'),
};

const VolunteeringPage = (): ReactElement => {
  return (
    <AccountPageContainer
      title="Volunteering"
      actions={
        <Link
          href={`${webappUrl}/settings/profile/experience/edit?type=${UserExperienceType.Volunteering}`}
        >
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
        experienceType={UserExperienceType.Volunteering}
        emptyStateMessage="No volunteering experience added yet"
      />
    </AccountPageContainer>
  );
};

VolunteeringPage.getLayout = getSettingsLayout;
VolunteeringPage.layoutProps = { seo };

export default VolunteeringPage;
