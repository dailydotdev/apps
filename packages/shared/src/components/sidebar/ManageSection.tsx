import React, { ReactElement } from 'react';
import BookmarkIcon from '../icons/Bookmark';
import EyeIcon from '../icons/Eye';
import PauseIcon from '../icons/Pause';
import PlayIcon from '../icons/Play';
import SettingsIcon from '../icons/Settings';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';

interface ManageSectionProps extends SectionCommonProps {
  isDndActive?: boolean;
  showDnd?: boolean;
  onShowDndClick?: () => void;
  showSettings: boolean;
  onShowSettings: (value: boolean) => void;
}

export function ManageSection({
  isDndActive,
  showDnd,
  onShowDndClick,
  showSettings,
  onShowSettings,
  ...props
}: ManageSectionProps): ReactElement {
  const shouldShowDnD = !!process.env.TARGET_BROWSER;
  const manageMenuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BookmarkIcon secondary={active} />} />
      ),
      title: 'Bookmarks',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}bookmarks`,
      hideOnMobile: true,
      requiresLogin: true,
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <EyeIcon secondary={active} />} />
      ),
      title: 'Reading history',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}history`,
      requiresLogin: true,
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <SettingsIcon secondary={active} />} />
      ),
      title: 'Customize',
      action: () => onShowSettings(true),
      active: showSettings,
    },
  ];

  if (shouldShowDnD) {
    const DndIcon = isDndActive ? PlayIcon : PauseIcon;
    const dndMenuItem = {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <DndIcon secondary={active} />} />
      ),
      title: 'Pause new tab',
      action: onShowDndClick,
      active: showDnd,
    };
    manageMenuItems.splice(2, 0, dndMenuItem);
  }

  return (
    <Section
      {...props}
      title="Manage"
      items={manageMenuItems}
      isItemsButton={false}
    />
  );
}
