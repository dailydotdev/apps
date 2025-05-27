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
import { settingsUrl, webappUrl } from '@dailydotdev/shared/src/lib/constants';
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
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import {
  DEFAULT_ERROR,
  gqlClient,
} from '@dailydotdev/shared/src/graphql/common';

import { parseOrDefault } from '@dailydotdev/shared/src/lib/func';
import { useMutation } from '@tanstack/react-query';
import type { PromptOptions } from '@dailydotdev/shared/src/hooks/usePrompt';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { LEAVE_ORGANIZATION_MUTATION } from '@dailydotdev/shared/src/features/organizations/graphql';
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
  const { push, query, replace } = useRouter();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { user } = useAuthContext();
  const { organization, role, isFetching } = useOrganization(
    query.orgId as string,
  );

  const { mutateAsync: leaveOrganization, isPending: isLeavingOrganization } =
    useMutation({
      mutationFn: async () => {
        await gqlClient.request(LEAVE_ORGANIZATION_MUTATION, {
          id: organization.id,
        });
      },
      onSuccess: async () => {
        replace(webappUrl);
      },
      onError: (error: ApiErrorResult) => {
        const result = parseOrDefault<Record<string, string>>(
          error?.response?.errors?.[0]?.message,
        );

        displayToast(
          typeof result === 'object' ? result.handle : DEFAULT_ERROR,
        );
      },
    });

  const onLeaveClick = async () => {
    const options: PromptOptions = {
      title: 'Leave organization',
      description: 'Are you sure you want to leave this organization?',
      okButton: {
        title: 'Leave',
        className: 'btn-primary-ketchup',
      },
    };
    if (await showPrompt(options)) {
      await leaveOrganization();
    }
  };

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
              disabled={isLeavingOrganization}
              onClick={onLeaveClick}
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
                  type: LazyModal.OrganizationInviteMember,
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
