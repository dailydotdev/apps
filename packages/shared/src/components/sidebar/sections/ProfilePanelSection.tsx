import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { Section } from '../Section';
import { PinnedSection } from './PinnedSection';
import { BookmarkSection } from './BookmarkSection';
import {
  AnalyticsIcon,
  AppIcon,
  DevCardIcon,
  DevPlusIcon,
  EyeIcon,
  JobIcon,
  SquadIcon,
} from '../../icons';
import type { SidebarSectionProps } from './common';
import { OtherFeedPage } from '../../../lib/query';
import { plusUrl, settingsUrl, webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks';
import Link from '../../utilities/Link';
import { ProfileMenuHeader } from '../../ProfileMenu/ProfileMenuHeader';
import { ProfileImageSize } from '../../ProfilePicture';
import { SidebarProfileStats } from '../SidebarProfileStats';
import { UpgradeToPlus } from '../../UpgradeToPlus';
import { ButtonSize } from '../../buttons/Button';
import { TargetId } from '../../../lib/log';

// The avatar tab panel. Everything "you": identity + your feeds/activity, your
// pinned squads and custom feeds. Account/app controls live in the bottom
// settings gear instead, so this stays profile-focused.
export const ProfilePanelSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();

  const menuItems: SidebarMenuItem[] = useMemo(
    () =>
      [
        {
          title: 'Following',
          path: '/following',
          action: () => onNavTabClick?.(OtherFeedPage.Following),
          icon: (active: boolean) => (
            <ListIcon Icon={() => <SquadIcon secondary={active} />} />
          ),
        },
        {
          title: 'History',
          path: `${webappUrl}history`,
          isForcedLink: true,
          icon: (active: boolean) => (
            <ListIcon Icon={() => <EyeIcon secondary={active} />} />
          ),
        },
        {
          title: 'Analytics',
          path: `${webappUrl}analytics`,
          isForcedLink: true,
          icon: (active: boolean) => (
            <ListIcon Icon={() => <AnalyticsIcon secondary={active} />} />
          ),
        },
        {
          title: 'Jobs',
          path: `${webappUrl}jobs`,
          isForcedLink: true,
          icon: (active: boolean) => (
            <ListIcon Icon={() => <JobIcon secondary={active} />} />
          ),
        },
        {
          title: 'Feed settings',
          path: `${settingsUrl}/feed/general`,
          isForcedLink: true,
          // Leaves the sidebar for the Settings page → show the open-link hint.
          showOpenLinkIcon: true,
          icon: (active: boolean) => (
            <ListIcon Icon={() => <AppIcon secondary={active} />} />
          ),
        },
        {
          title: 'DevCard',
          path: `${settingsUrl}/customization/devcard`,
          isForcedLink: true,
          showOpenLinkIcon: true,
          icon: (active: boolean) => (
            <ListIcon Icon={() => <DevCardIcon secondary={active} />} />
          ),
        },
        // Non-Plus only: a purple "Get API Access" upgrade CTA (API access is a
        // Plus perk). Plus users already have it, so it's hidden for them.
        !isPlus && {
          title: 'Get API Access',
          path: plusUrl,
          isForcedLink: true,
          requiresLogin: true,
          color: 'text-action-plus-default',
          itemClassName: 'bg-action-plus-float/50 hover:bg-action-plus-float',
          disableDefaultBackground: true,
          icon: (active: boolean) => (
            <ListIcon Icon={() => <DevPlusIcon secondary={active} />} />
          ),
        },
      ].filter(Boolean) as SidebarMenuItem[],
    [onNavTabClick, isPlus],
  );

  if (!user) {
    return null;
  }

  return (
    <>
      {/* The list rows below inset their icon inside a w-9 column (≈8px), so
          pl-5 lines the avatar/stats left edge up with those icons; pr-6
          matches the rows' right content edge. mb-4 gives the menu list below
          a clear section-level gap from the stats/header. */}
      <div className="mb-4 flex flex-col gap-3 pl-5 pr-6">
        {/* Clickable to the profile, but without the open-link icon — the
            avatar isn't a "leaves the sidebar" destination in that sense. */}
        <Link href={`${webappUrl}${user.username}`} passHref>
          <a className="-mx-1 rounded-10 px-1 hover:bg-surface-hover">
            <ProfileMenuHeader
              compact
              profileImageSize={ProfileImageSize.Medium}
            />
          </a>
        </Link>
        <SidebarProfileStats />
        <UpgradeToPlus
          target={TargetId.ProfileDropdown}
          size={ButtonSize.Small}
          className="flex-initial"
        />
      </div>
      <Section
        {...defaultRenderSectionProps}
        items={menuItems}
        isItemsButton={isItemsButton}
        className="!mt-0"
      />
      <PinnedSection {...defaultRenderSectionProps} isItemsButton={false} />
      <BookmarkSection
        {...defaultRenderSectionProps}
        title="Bookmarks"
        isItemsButton={false}
      />
    </>
  );
};
