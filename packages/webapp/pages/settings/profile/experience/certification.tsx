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
  ...getPageSeoTitles('Certifications'),
};

const CertificationsPage = (): ReactElement => {
  return (
    <AccountPageContainer
      title="Certifications"
      actions={
        <Link
          href={`${webappUrl}settings/profile/experience/edit?type=${UserExperienceType.Certification}`}
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
        experienceType={UserExperienceType.Certification}
        emptyStateMessage="No certifications added yet"
      />
    </AccountPageContainer>
  );
};

CertificationsPage.getLayout = getSettingsLayout;
CertificationsPage.layoutProps = { seo };

export default CertificationsPage;
