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
  DateFormat,
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
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
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
  EyeIcon,
  MenuIcon,
  StarIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { PromptOptions } from '@dailydotdev/shared/src/hooks/usePrompt';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SeatsOverview } from '@dailydotdev/shared/src/features/organizations/components/SeatsOverview';
import classNames from 'classnames';
import { TimeFormatType } from '@dailydotdev/shared/src/lib/dateFormat';
import classed from '@dailydotdev/shared/src/lib/classed';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import type { MenuItemProps } from '@dailydotdev/shared/src/components/dropdown/common';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getOrganizationLayout } from '../../../../components/layouts/OrganizationLayout';

const OrganizationOptionsMenu = ({
  member,
}: {
  member: Omit<OrganizationMember, 'lastActive'>;
}) => {
  const { user: currentUser } = useAuthContext();
  const router = useRouter();
  const {
    removeOrganizationMember,
    updateOrganizationMemberRole,
    toggleOrganizationMemberSeat,
  } = useOrganization(router.query.orgId as string);

  const { user, role, seatType } = member || {};

  const isCurrentUser = currentUser.id === user.id;

  const options: Array<MenuItemProps> = [];

  const memberHasPlusOutsideOrg =
    user.isPlus && seatType === OrganizationMemberSeatType.Free;

  options.push({
    label:
      seatType === OrganizationMemberSeatType.Plus
        ? 'Downgrade to Free'
        : 'Upgrade to Plus',
    icon: <DevPlusIcon aria-hidden />,
    action: () => toggleOrganizationMemberSeat({ memberId: user.id }),

    ...(memberHasPlusOutsideOrg && {
      disabled: true,
      Wrapper: ({ children }) => (
        <Tooltip
          content={
            <>
              This member already has a Plus subscription outside of your
              organization. <br />
              Upgrades managed by the organization are not available for them.
            </>
          }
        >
          <div>{children}</div>
        </Tooltip>
      ),
    }),
  });

  options.push({
    label: 'View profile',
    anchorProps: {
      href: `${webappUrl}${member.user.username}`,
    },
    icon: <UserIcon aria-hidden />,
  });

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
      action: () => removeOrganizationMember({ memberId: user.id }),
      icon: <ClearIcon aria-hidden />,
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.Tertiary}
          className="my-auto"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MemberWrapper = classed(
  'div',
  'flex items-center justify-between gap-4 tablet:grid tablet:grid-cols-[3.5fr_1fr_1fr_40px]',
);

const OrganizationMembersItem = ({
  isCurrentUser,
  user,
  role,
  seatType,
  lastActive,
  isRegularMember = false,
}: {
  isCurrentUser: boolean;
  user: OrganizationMember['user'];
  role: OrganizationMember['role'];
  seatType: OrganizationMember['seatType'];
  lastActive: OrganizationMember['lastActive'];
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

  return (
    <MemberWrapper className={classNames(isRegularMember && '!flex')}>
      <div
        className={classNames(
          'flex min-w-0 flex-1 items-center gap-2',
          isRegularMember && 'col-span-3',
        )}
      >
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
            truncate
          >
            {user.username}
          </Typography>

          {!isRegularMember && isMobile && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="flex items-center gap-1"
            >
              <EyeIcon size={IconSize.Size16} />
              {lastActive ? (
                <DateFormat
                  date={lastActive}
                  type={TimeFormatType.LastActivity}
                />
              ) : (
                '-'
              )}
            </Typography>
          )}
        </div>
      </div>
      {!isRegularMember ? (
        <>
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

          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="hidden items-center tablet:flex"
          >
            {lastActive ? (
              <DateFormat
                date={lastActive}
                type={TimeFormatType.LastActivity}
              />
            ) : (
              '-'
            )}
          </Typography>

          <OrganizationOptionsMenu member={{ user, role, seatType }} />
        </>
      ) : (
        !blocked &&
        !isCurrentUser && (
          <FollowButton
            entityId={user.id}
            variant={ButtonVariant.Primary}
            type={ContentPreferenceType.User}
            status={contentPreference?.status}
            entityName={`@${user.username}`}
            className="ml-auto"
          />
        )
      )}
    </MemberWrapper>
  );
};

const Page = (): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { push, query } = useRouter();
  const { openModal } = useLazyModal();
  const { showPrompt } = usePrompt();
  const { user } = useAuthContext();
  const {
    organization,
    role,
    seatType,
    isFetching,
    isOwner,
    leaveOrganization,
    isLeavingOrganization,
  } = useOrganization(query.orgId as string);

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

  const members = [
    { role, user, seatType, lastActive: new Date() },
    ...organization.members,
  ];

  if (isFetching) {
    return null;
  }

  return (
    <AccountPageContainer
      title={isRegularMember ? organization.name : 'Members overview'}
      className={{ container: 'max-w-full', section: 'gap-6' }}
      onBack={
        isRegularMember ? () => push(`${settingsUrl}/organization`) : undefined
      }
      actions={
        <>
          {!isOwner && (
            <Button
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              disabled={isLeavingOrganization}
              onClick={onLeaveClick}
            >
              Leave organization
            </Button>
          )}
          {isOwner && (
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
          <>
            <div className="flex items-center justify-between gap-4">
              <Typography bold type={TypographyType.Body} className="flex-1">
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

            {!isMobile && (
              <MemberWrapper>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  Name
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  Seat type
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  Last activity
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                  aria-label="Actions"
                />
              </MemberWrapper>
            )}
          </>
        )}

        {members.map((member) => (
          <OrganizationMembersItem
            key={`organization-member-${member.user.id}`}
            isCurrentUser={member.user.id === user.id}
            user={member.user}
            role={member.role}
            seatType={member.seatType}
            lastActive={member.lastActive}
            isRegularMember={isRegularMember}
          />
        ))}
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
