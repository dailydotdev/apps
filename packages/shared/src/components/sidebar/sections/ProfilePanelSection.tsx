import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
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
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { PlusUser } from '../../PlusUser';
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
  const router = useRouter();

  // The header links to your profile, so highlight it as the active row (same
  // look as the Explore/Squads rows) whenever you're on your profile page or
  // any of its sub-pages — mirrors how the rail resolves the Profile tab.
  const currentPath = (router?.asPath || '').split('?')[0];
  const profileBase = user?.username ? `/${user.username}` : null;
  const isProfileActive =
    !!profileBase &&
    (currentPath === profileBase || currentPath.startsWith(`${profileBase}/`));

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
          <a
            aria-current={isProfileActive ? 'page' : undefined}
            className={classNames(
              '-mx-2 flex rounded-12 px-2 py-2',
              isProfileActive ? 'bg-surface-hover' : 'hover:bg-surface-hover',
            )}
          >
            {/* No @handle here — clicking through to the profile page already
                shows it. Just the avatar + name, centered against each other. */}
            <div className="flex items-center gap-2">
              <ProfilePicture
                user={user}
                nativeLazyLoading
                eager
                size={ProfileImageSize.Medium}
                className="!rounded-10 border-background-default"
              />
              <div className="flex min-w-0 items-center gap-1">
                <Typography
                  type={TypographyType.Subhead}
                  color={TypographyColor.Primary}
                  bold
                  truncate
                  className="min-w-0"
                >
                  {user.name}
                </Typography>
                {isPlus && <PlusUser withText={false} />}
              </div>
            </div>
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
