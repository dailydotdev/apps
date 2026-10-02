import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import type { Squad } from '../../../../graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
} from '../../../../graphql/sources';
import { verifyPermission } from '../../../../graphql/squads';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { useLeaveSquad } from '../../../../hooks/useLeaveSquad';
import { useSquadInvitation } from '../../../../hooks/useSquadInvitation';
import { useContentPreference } from '../../../../hooks/contentPreference/useContentPreference';
import { useGetSquadAwardAdmin } from '../../../../hooks/useCoresFeature';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { ContentPreferenceType } from '../../../../graphql/contentPreference';
import { squadFeedback } from '../../../../lib/constants';
import { LogEvent, Origin } from '../../../../lib/log';
import type { LoggedUser } from '../../../../lib/user';
import {
  AnalyticsIcon,
  BellIcon,
  ExitIcon,
  FeedbackIcon,
  FlagIcon,
  HashtagIcon,
  LinkIcon,
  MedalBadgeIcon,
  MenuIcon,
  SettingsIcon,
  ShareIcon,
  TimerIcon,
  TourIcon,
  UserIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../../../components/dropdown/DropdownMenu';
import type { MenuItemProps } from '../../../../components/dropdown/common';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import Link from '../../../../components/utilities/Link';
import { useSquadPageContext } from '../../SquadPageContext';
import { useShareOrCopyLink } from '../../../../hooks/useShareOrCopyLink';
import { ReferralCampaignKey } from '../../../../lib/referral';
import { getSquadShareText } from '../widgets/SquadShareWidget';
import { isJoinedViewer, isStaffViewer, SquadViewer } from '../../lib/viewer';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';
import { getSquadId } from '../../lib/features';

interface ManageEntry {
  label: string;
  icon: ReactNode;
  href: string;
  badge?: number;
}

const getManageEntries = (squad: Squad): ManageEntry[] => {
  const entries: ManageEntry[] = [];
  const { handle } = squad;

  if (verifyPermission(squad, SourcePermissions.ModeratePost)) {
    entries.push({
      label: 'Moderation',
      icon: <TimerIcon size={IconSize.Small} />,
      href: getSquadManageUrl(handle, SquadManageSection.Moderation),
      badge: squad.moderationPostCount,
    });
  }

  if (!verifyPermission(squad, SourcePermissions.Edit)) {
    entries.push({
      label: 'Members',
      icon: <UserIcon size={IconSize.Small} />,
      href: getSquadManageUrl(handle, SquadManageSection.Members),
    });
  }

  if (verifyPermission(squad, SourcePermissions.ViewAnalytics)) {
    entries.push({
      label: 'Analytics',
      icon: <AnalyticsIcon size={IconSize.Small} />,
      href: getSquadManageUrl(handle, SquadManageSection.Analytics),
    });
  }

  if (verifyPermission(squad, SourcePermissions.Edit)) {
    entries.push({
      label: 'Settings',
      icon: <SettingsIcon size={IconSize.Small} />,
      href: getSquadManageUrl(handle, SquadManageSection.Details),
    });
  }

  return entries;
};

export const SquadOptionsMenu = ({
  className,
  variant = ButtonVariant.Subtle,
  size = ButtonSize.Small,
}: {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
} = {}): ReactElement => {
  const router = useRouter();
  const { squad, viewer } = useSquadPageContext();
  const { user, isLoggedIn } = useAuthContext();
  const { openModal } = useLazyModal();
  const { follow, unfollow } = useContentPreference();
  const { logAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadPage,
  });
  const awardAdmin = useGetSquadAwardAdmin({ sendingUser: user, squad });
  const [, onShare] = useShareOrCopyLink({
    link: squad.permalink,
    text: getSquadShareText(squad),
    cid: ReferralCampaignKey.ShareSource,
    logObject: (provider) => ({
      event_name: LogEvent.ShareSource,
      target_id: squad.id,
      extra: JSON.stringify({ provider, origin: Origin.SquadPage }),
    }),
  });
  const { mutateAsync: onLeaveSquad } = useMutation({
    mutationFn: useLeaveSquad({ squad }),
    onSuccess: (left) => {
      // From the squad's own page there is nothing left to show; from a
      // card elsewhere the page stays.
      if (left && router.pathname.startsWith('/squads/[handle]')) {
        router.replace('/');
      }
    },
  });
  const isStaff = isStaffViewer(viewer);
  const isJoined = isJoinedViewer(viewer);
  const manageEntries = useMemo(
    () => (isStaff ? getManageEntries(squad) : []),
    [isStaff, squad],
  );

  const options = useMemo(() => {
    const list: MenuItemProps[] = [
      {
        icon: <HashtagIcon size={IconSize.Small} />,
        label: 'Add to custom feed',
        action: () =>
          openModal({
            type: LazyModal.AddToCustomFeed,
            props: {
              onAdd: (feedId) =>
                follow({
                  id: getSquadId(squad),
                  entity: ContentPreferenceType.Source,
                  entityName: squad.handle,
                  feedId,
                }),
              onUndo: (feedId) =>
                unfollow({
                  id: getSquadId(squad),
                  entity: ContentPreferenceType.Source,
                  entityName: squad.handle,
                  feedId,
                }),
              onCreateNewFeed: () =>
                router.push(
                  `/feeds/new?entityId=${squad.id}&entityType=${ContentPreferenceType.Source}`,
                ),
            },
          }),
      },
    ];

    if (isLoggedIn && squad.public && viewer === SquadViewer.Visitor) {
      list.push({
        icon: <LinkIcon size={IconSize.Small} />,
        label: 'Invitation link',
        action: () => logAndCopyLink(),
      });
    }

    if (awardAdmin && viewer !== SquadViewer.Blocked) {
      list.push({
        icon: <MedalBadgeIcon size={IconSize.Small} />,
        label: 'Award the Squad',
        action: () =>
          openModal({
            type: LazyModal.GiveAward,
            props: {
              type: 'SQUAD',
              entity: {
                id: getSquadId(squad),
                receiver: {
                  ...awardAdmin,
                  name: squad.name,
                  image: squad.image,
                } as LoggedUser,
              },
            },
          }),
      });
    }

    list.unshift({
      icon: <ShareIcon size={IconSize.Small} />,
      label: 'Share',
      action: () => onShare(),
    });

    if (isJoined) {
      list.splice(1, 0, {
        icon: <BellIcon size={IconSize.Small} />,
        label: 'Notifications',
        action: () =>
          openModal({
            type: LazyModal.SquadNotifications,
            props: { squad },
          }),
      });
    }

    list.push({
      icon: <TourIcon size={IconSize.Small} />,
      label: 'Learn how Squads work',
      action: () => openModal({ type: LazyModal.SquadTour }),
    });

    if (isJoined) {
      list.push({
        icon: <FeedbackIcon size={IconSize.Small} />,
        label: 'Feedback',
        anchorProps: {
          href: `${squadFeedback}#user_id=${squad.currentMember?.user?.id}&squad_id=${squad.id}`,
          target: '_blank',
        },
      });
    }

    list.push({
      icon: <FlagIcon size={IconSize.Small} />,
      label: 'Report Squad',
      action: () =>
        openModal({ type: LazyModal.ReportSource, props: { squad } }),
    });

    if (isJoined && squad.currentMember?.role !== SourceMemberRole.Admin) {
      list.push({
        icon: <ExitIcon size={IconSize.Small} />,
        label: 'Leave Squad',
        action: () => onLeaveSquad({}),
      });
    }

    return list;
  }, [
    awardAdmin,
    follow,
    isJoined,
    isLoggedIn,
    logAndCopyLink,
    onLeaveSquad,
    onShare,
    openModal,
    router,
    squad,
    unfollow,
    viewer,
  ]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        tooltip={{ content: isStaff ? 'Manage and options' : 'Squad options' }}
        asChild
      >
        <Button
          variant={variant}
          size={size}
          className={className}
          icon={<MenuIcon />}
          aria-label="Squad options"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {manageEntries.length > 0 && (
          <>
            <div className="px-2.5 pb-1 pt-2 font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption2">
              Manage
            </div>
            {manageEntries.map(({ label, icon, href, badge }) => (
              <DropdownMenuItem key={label}>
                <Link href={href} passHref>
                  <a
                    href={href}
                    role="menuitem"
                    className="inline-flex min-w-0 flex-1 items-center gap-2"
                  >
                    {icon}
                    <span className="min-w-0 flex-1">{label}</span>
                    {!!badge && (
                      <span className="rounded-8 bg-surface-float px-1.5 font-bold tabular-nums text-text-tertiary typo-caption2">
                        {badge}
                      </span>
                    )}
                  </a>
                </Link>
              </DropdownMenuItem>
            ))}
            <div
              aria-hidden
              className="my-1 h-px bg-border-subtlest-tertiary"
            />
          </>
        )}
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
