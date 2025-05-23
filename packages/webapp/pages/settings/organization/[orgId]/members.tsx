import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import { useOrganization } from '@dailydotdev/shared/src/features/organizations/hooks/useOrganizations';

import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

import UserBadge from '@dailydotdev/shared/src/components/UserBadge';
import { getRoleName } from '@dailydotdev/shared/src/components/utilities';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { settingsUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getOrganizationLayout } from '../../../../components/layouts/OrganizationLayout';

const Page = (): ReactElement => {
  const { push, query } = useRouter();
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const { organization, role, isFetching } = useOrganization(
    query.orgId as string,
  );

  if (isFetching) {
    return null;
  }

  return (
    <AccountPageContainer
      title={organization.organization.name}
      className={{ section: 'gap-6' }}
      onBack={() => push(`${settingsUrl}/organization`)}
      actions={
        <>
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            onClick={() => {
              displayToast(
                'Ouch! Leaving an organization is not supported yet',
              );
            }}
          >
            Leave organization
          </Button>
        </>
      }
    >
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ProfilePicture
            size={ProfileImageSize.Large}
            user={user}
            nativeLazyLoading
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Typography bold type={TypographyType.Callout}>
                You
              </Typography>

              <UserBadge role={role} className="mt-0.5">
                {getRoleName(role)}
              </UserBadge>
            </div>

            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              {user.email}
            </Typography>
          </div>
        </div>
      </section>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Organization members'),
};

Page.getLayout = getOrganizationLayout;
Page.layoutProps = { seo };

export default Page;
