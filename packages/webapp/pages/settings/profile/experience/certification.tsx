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

const addUrl = `${webappUrl}settings/profile/experience/edit?type=${UserExperienceType.Certification}`;

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Certifications'),
  ...noindexSeoProps,
};

const CertificationsPage = (): ReactElement => {
  return (
    <AccountPageContainer
      title="Certifications"
      phoneActions={
        <AccountPageAddSquare href={addUrl} label="Add certification" />
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
        experienceType={UserExperienceType.Certification}
        emptyStateMessage="No certifications added yet"
      />
    </AccountPageContainer>
  );
};

CertificationsPage.getLayout = getSettingsLayout;
CertificationsPage.layoutProps = { seo };

export default CertificationsPage;
