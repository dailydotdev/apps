import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import { useOrganization } from '@dailydotdev/shared/src/features/organizations/hooks/useOrganization';

import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

import UserBadge from '@dailydotdev/shared/src/components/UserBadge';
import {
  getRoleName,
  HorizontalSeparator,
} from '@dailydotdev/shared/src/components/utilities';
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
import {
  AddUserIcon,
  DevPlusIcon,
  InfoIcon,
  PlusUserIcon,
  SquadIcon,
} from '@dailydotdev/shared/src/components/icons';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getOrganizationLayout } from '../../../../components/layouts/OrganizationLayout';

const OrganizationMembersItem = ({
  isCurrentUser,
  user,
  role,
  isRegularMember = false,
}: {
  isCurrentUser: boolean;
  user: OrganizationMember['user'];
  role: OrganizationMember['role'];
  isRegularMember?: boolean;
}) => {
  const isPrivilegedMember = isPrivilegedOrganizationRole(role);
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: user?.id,
    entity: ContentPreferenceType.User,
    queryOptions: { enabled: !isCurrentUser },
  });

  const blocked = contentPreference?.status === ContentPreferenceStatus.Blocked;

  return (
    <div className="flex items-center gap-2">
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

          {isPrivilegedMember && (
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

      {!blocked && !isCurrentUser && isRegularMember && (
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
  isRegularMember = false,
}: {
  members: OrganizationMember[];
  isRegularMember?: boolean;
}) => {
  const { user: currentUser } = useAuthContext();
  return members?.map(({ user, role }) => (
    <OrganizationMembersItem
      key={`organization-member-${user.id}`}
      isCurrentUser={user.id === currentUser.id}
      user={user}
      role={role}
      isRegularMember={isRegularMember}
    />
  ));
};

const Page = (): ReactElement => {
  const { push, query } = useRouter();
  const { openModal } = useLazyModal();
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
      {!isRegularMember && (
        <>
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <SquadIcon secondary />
              <Typography type={TypographyType.Footnote}>
                Total seats:
              </Typography>
              <Typography bold type={TypographyType.Footnote}>
                {organization.seats}
              </Typography>

              <SimpleTooltip content="TODO: Update copy">
                <div>
                  <InfoIcon />
                </div>
              </SimpleTooltip>
            </div>
            <div className="flex items-center gap-2">
              <PlusUserIcon />
              <Typography type={TypographyType.Footnote}>
                Assigned seats:
              </Typography>
              <Typography bold type={TypographyType.Footnote}>
                {organization.seats}
              </Typography>

              <SimpleTooltip content="TODO: Implement assigned seats">
                <div>
                  <InfoIcon />
                </div>
              </SimpleTooltip>
            </div>
            <div className="flex items-center gap-2">
              <DevPlusIcon secondary />
              <Typography type={TypographyType.Footnote}>
                Available seats:
              </Typography>
              <Typography bold type={TypographyType.Footnote}>
                {organization.seats}
              </Typography>

              <SimpleTooltip content="TODO: Implement available seats">
                <div>
                  <InfoIcon />
                </div>
              </SimpleTooltip>
            </div>
          </section>
          <HorizontalSeparator />
        </>
      )}

      <section className="flex flex-col gap-4">
        {!isRegularMember && (
          <div className="flex items-center justify-between">
            <Typography bold type={TypographyType.Body}>
              Team members
            </Typography>

            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={<AddUserIcon secondary />}
              onClick={() => {
                openModal({
                  type: LazyModal.InviteOrganizationMember,
                  props: {
                    organizationId: organization.id,
                  },
                });
              }}
            >
              Invite member
            </Button>
          </div>
        )}
        <OrganizationMembers
          members={[{ role, user }, ...organization.members]}
          isRegularMember={isRegularMember}
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
