import React, { useId } from 'react';
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
import {
  useToastNotification,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { isPrivilegedOrganizationRole } from '@dailydotdev/shared/src/features/organizations/utils';
import type { OrganizationMember } from '@dailydotdev/shared/src/features/organizations/types';
import {
  OrganizationMemberRole,
  OrganizationMemberSeatType,
} from '@dailydotdev/shared/src/features/organizations/types';
import { useContentPreferenceStatusQuery } from '@dailydotdev/shared/src/hooks/contentPreference/useContentPreferenceStatusQuery';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '@dailydotdev/shared/src/graphql/contentPreference';
import { FollowButton } from '@dailydotdev/shared/src/components/contentPreference/FollowButton';
import {
  AddUserIcon,
  ClearIcon,
  DevPlusIcon,
  StarIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import {
  DEFAULT_ERROR,
  gqlClient,
} from '@dailydotdev/shared/src/graphql/common';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PromptOptions } from '@dailydotdev/shared/src/hooks/usePrompt';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { LEAVE_ORGANIZATION_MUTATION } from '@dailydotdev/shared/src/features/organizations/graphql';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import type { MenuItemProps } from '@dailydotdev/shared/src/components/fields/ContextMenu';
import ContextMenu from '@dailydotdev/shared/src/components/fields/ContextMenu';
import OptionsButton from '@dailydotdev/shared/src/components/buttons/OptionsButton';
import useContextMenu from '@dailydotdev/shared/src/hooks/useContextMenu';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SeatsOverview } from '@dailydotdev/shared/src/features/organizations/components/SeatsOverview';
import type { ContextMenuDrawerItem } from '@dailydotdev/shared/src/components/drawers/ContextMenuDrawer';
import classNames from 'classnames';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getOrganizationLayout } from '../../../../components/layouts/OrganizationLayout';

const OrganizationOptionsMenu = ({
  member,
}: {
  member: OrganizationMember;
}) => {
  const { user: currentUser } = useAuthContext();
  const contextMenuId = useId();
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { isOpen, onMenuClick } = useContextMenu({ id: contextMenuId });
  const { removeOrganizationMember, updateOrganizationMemberRole } =
    useOrganization(router.query.orgId as string);

  const { user, role, seatType } = member || {};

  const isCurrentUser = currentUser.id === user.id;

  const options: Array<MenuItemProps | ContextMenuDrawerItem> = [
    {
      label:
        seatType === OrganizationMemberSeatType.Plus
          ? 'Downgrade to Free'
          : 'Upgrade to Plus',
      icon: <DevPlusIcon aria-hidden />,
      action: () => {
        displayToast('click me');
      },
    },
    {
      label: 'View profile',
      action: () => {
        router.push(`${webappUrl}/${member.user.username}`);
      },
      icon: <UserIcon aria-hidden />,
    },
  ];

  if (!isCurrentUser && role !== OrganizationMemberRole.Owner) {
    options.push({
      label:
        role === OrganizationMemberRole.Admin
          ? 'Remove admin access'
          : 'Promote to admin',
      action: () =>
        updateOrganizationMemberRole({
          memberId: user.id,
          role:
            role === OrganizationMemberRole.Admin
              ? OrganizationMemberRole.Member
              : OrganizationMemberRole.Admin,
        }),
      icon: <StarIcon aria-hidden />,
    });

    options.push({
      label: 'Remove from organization',
      action: () => removeOrganizationMember(user.id),
      icon: <ClearIcon aria-hidden />,
    });
  }

  return (
    <>
      <OptionsButton onClick={onMenuClick} />
      <ContextMenu options={options} id={contextMenuId} isOpen={isOpen} />
    </>
  );
};

const OrganizationMembersItem = ({
  isCurrentUser,
  user,
  role,
  seatType,
  isRegularMember = false,
}: {
  isCurrentUser: boolean;
  user: OrganizationMember['user'];
  role: OrganizationMember['role'];
  seatType: OrganizationMember['seatType'];
  isRegularMember?: boolean;
}) => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const isPrivilegedMember = isPrivilegedOrganizationRole(role);
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: user?.id,
    entity: ContentPreferenceType.User,
    queryOptions: { enabled: !isCurrentUser },
  });

  const blocked = contentPreference?.status === ContentPreferenceStatus.Blocked;

  /* TODO: fetch real value */
  const lastActive = '1 hour ago';

  return (
    <tr>
      <td className="flex items-center gap-2" colSpan={isRegularMember ? 3 : 1}>
        <ProfilePicture
          size={isMobile ? ProfileImageSize.Medium : ProfileImageSize.Large}
          user={user}
          nativeLazyLoading
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <Typography
              bold
              truncate
              type={TypographyType.Callout}
              className="shrink"
            >
              {isCurrentUser ? 'You' : user.name}
            </Typography>

            {isPrivilegedMember && (
              <UserBadge role={role} className="mr-3 mt-0.5">
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
      </td>
      {!isRegularMember ? (
        <>
          <td>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="flex items-center justify-end gap-0.5 tablet:justify-normal"
            >
              {seatType === OrganizationMemberSeatType.Plus ? (
                <>
                  <DevPlusIcon
                    className={classNames(TypographyColor.Plus)}
                    secondary
                    size={IconSize.Size16}
                  />
                  <span>Plus</span>
                </>
              ) : (
                <span className="pl-4">Free</span>
              )}
            </Typography>
          </td>
          <td className="hidden tablet:table-cell">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {lastActive}
            </Typography>
          </td>
          <td>
            <OrganizationOptionsMenu member={{ user, role, seatType }} />
          </td>
        </>
      ) : (
        <td className="text-right">
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
        </td>
      )}
    </tr>
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

  return (
    <tbody>
      {members?.map(({ user, role, seatType }) => (
        <OrganizationMembersItem
          key={`organization-member-${user.id}`}
          isCurrentUser={user.id === currentUser.id}
          user={user}
          role={role}
          seatType={seatType}
          isRegularMember={isRegularMember}
        />
      ))}
    </tbody>
  );
};

const Page = (): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { push, query, replace } = useRouter();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { user } = useAuthContext();
  const { organization, role, seatType, isFetching, isOwner } = useOrganization(
    query.orgId as string,
  );
  const queryClient = useQueryClient();

  const { mutateAsync: leaveOrganization, isPending: isLeavingOrganization } =
    useMutation({
      mutationFn: async () => {
        await gqlClient.request(LEAVE_ORGANIZATION_MUTATION, {
          id: organization.id,
        });
      },
      onSuccess: async () => {
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.Organizations, user),
        });
        replace(`${settingsUrl}/organization`);
      },
      onError: (_err: ApiErrorResult) => {
        const error = _err?.response?.errors?.[0];

        displayToast(typeof error === 'object' ? error.message : DEFAULT_ERROR);
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
                openModal({
                  type: LazyModal.OrganizationManageSeats,
                  props: {
                    organizationId: organization.id,
                  },
                });
              }}
              disabled={!isOwner}
            >
              Manage seats
            </Button>
          )}
        </>
      }
    >
      {!isRegularMember && (
        <>
          <SeatsOverview organizationId={organization.id} />
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
        <table className="border-separate border-spacing-y-4">
          {!isRegularMember && !isMobile ? (
            <thead className="">
              <tr className="text-left">
                <th>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Quaternary}
                  >
                    Free
                  </Typography>
                </th>
                <th>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Quaternary}
                  >
                    Seat type
                  </Typography>
                </th>
                <th className="hidden tablet:table-cell">
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Quaternary}
                  >
                    Last activity
                  </Typography>
                </th>
                <th aria-label="Actions">&nbsp;</th>
              </tr>
            </thead>
          ) : null}
          <OrganizationMembers
            members={[{ role, user, seatType }, ...organization.members]}
            isRegularMember={isRegularMember}
          />
        </table>
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
