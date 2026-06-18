import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { Section } from '../Section';
import { PinnedSection } from './PinnedSection';
import { CustomFeedSection } from './CustomFeedSection';
import {
  AnalyticsIcon,
  DevCardIcon,
  EyeIcon,
  JobIcon,
  SquadIcon,
} from '../../icons';
import type { SidebarSectionProps } from './common';
import { OtherFeedPage } from '../../../lib/query';
import { settingsUrl, webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
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

  const menuItems: SidebarMenuItem[] = useMemo(
    () => [
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
        title: 'DevCard',
        path: `${settingsUrl}/customization/devcard`,
        isForcedLink: true,
        icon: (active: boolean) => (
          <ListIcon Icon={() => <DevCardIcon secondary={active} />} />
        ),
      },
    ],
    [onNavTabClick],
  );

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="mb-1 flex flex-col gap-3 px-3">
        <ProfileMenuHeader
          shouldOpenProfile
          compact
          profileImageSize={ProfileImageSize.Medium}
        />
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
      <CustomFeedSection
        {...defaultRenderSectionProps}
        onNavTabClick={onNavTabClick}
        title="Feeds"
        isItemsButton={false}
      />
    </>
  );
};
