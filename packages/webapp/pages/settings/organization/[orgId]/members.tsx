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
import { isPrivilegedOrganizationRole } from '@dailydotdev/shared/src/features/organizations/utils';
import type { OrganizationMember } from '@dailydotdev/shared/src/features/organizations/types';
import { useContentPreferenceStatusQuery } from '@dailydotdev/shared/src/hooks/contentPreference/useContentPreferenceStatusQuery';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '@dailydotdev/shared/src/graphql/contentPreference';
import { FollowButton } from '@dailydotdev/shared/src/components/contentPreference/FollowButton';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getOrganizationLayout } from '../../../../components/layouts/OrganizationLayout';

const OrganizationMembersItem = ({
  isCurrentUser,
  user,
  role,
}: {
  isCurrentUser: boolean;
  user: OrganizationMember['user'];
  role: OrganizationMember['role'];
}) => {
  const isPrivileged = isPrivilegedOrganizationRole(role);
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: user?.id,
    entity: ContentPreferenceType.User,
    queryOptions: { enabled: !isCurrentUser },
  });

  const blocked = contentPreference?.status === ContentPreferenceStatus.Blocked;

  return (
    <div
      key={`organization-member-${user.id}`}
      className="flex items-center gap-2"
    >
      <ProfilePicture
        size={ProfileImageSize.Large}
        user={user}
        nativeLazyLoading
      />

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Typography bold type={TypographyType.Callout}>
            {isCurrentUser ? 'You' : user.name}
          </Typography>

          {isPrivileged && (
            <UserBadge role={role} className="mt-0.5">
              {getRoleName(role)}
            </UserBadge>
          )}
        </div>

        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {user.username}
        </Typography>
      </div>

      {!blocked && !isCurrentUser && (
        <FollowButton
          entityId={user.id}
          variant={ButtonVariant.Primary}
          type={ContentPreferenceType.User}
          status={contentPreference?.status}
          entityName={`@${user.username}`}
          className="ml-auto"
        />
      )}
    </div>
  );
};

export const OrganizationMembers = ({
  members,
}: {
  members: OrganizationMember[];
}) => {
  const { user: currentUser } = useAuthContext();
  return members?.map(({ user, role }) => {
    return (
      <OrganizationMembersItem
        key={`organization-member-${user.id}`}
        isCurrentUser={user.id === currentUser.id}
        user={user}
        role={role}
      />
    );
  });
};

const Page = (): ReactElement => {
  const { push, query } = useRouter();
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const { organization, role, isFetching } = useOrganization(
    query.orgId as string,
  );

  const isRegularMember = !isPrivilegedOrganizationRole(role);

  if (isFetching) {
    return null;
  }

  return (
    <AccountPageContainer
      title={isRegularMember ? organization.name : 'Members overview'}
      className={{ section: 'gap-6' }}
      onBack={
        isRegularMember ? () => push(`${settingsUrl}/organization`) : undefined
      }
      actions={
        <>
          {isRegularMember && (
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
          )}
          {!isRegularMember && (
            <Button
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              onClick={() => {
                displayToast('Ouch! Managing seats is not supported yet');
              }}
            >
              Manage seats
            </Button>
          )}
        </>
      }
    >
      <section className="flex flex-col gap-4">
        <OrganizationMembers
          members={[{ role, user }, ...organization.members]}
        />
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
