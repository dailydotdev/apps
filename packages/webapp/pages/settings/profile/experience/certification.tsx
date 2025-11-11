import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import type { NextSeoProps } from 'next-seo';
import { useUserExperiencesByType } from '@dailydotdev/shared/src/features/profile/hooks/useUserExperiencesByType';
import { UserExperienceType } from '@dailydotdev/shared/src/graphql/user/profile';
import { UserExperienceList } from '@dailydotdev/shared/src/features/profile/components/experience/UserExperiencesList';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { defaultSeo } from '../../../../next-seo';
import { getSettingsLayout } from '../../../../components/layouts/SettingsLayout';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Certifications'),
};

const CertificationsPage = (): ReactElement => {
  const { experiences } = useUserExperiencesByType(
    UserExperienceType.Certification,
  );

  return (
    <AccountPageContainer
      title="Certifications"
      actions={
        <Link
          href={`${webappUrl}/settings/profile/experience/edit?type=${UserExperienceType.Certification}`}
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
      <div className="flex flex-col gap-4">
        {experiences && experiences.length > 0 ? (
          <UserExperienceList
            experiences={experiences}
            experienceType={UserExperienceType.Certification}
            isSameUser
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-text-secondary">No certifications added yet</p>
          </div>
        )}
      </div>
    </AccountPageContainer>
  );
};

CertificationsPage.getLayout = getSettingsLayout;
CertificationsPage.layoutProps = { seo };

export default CertificationsPage;
