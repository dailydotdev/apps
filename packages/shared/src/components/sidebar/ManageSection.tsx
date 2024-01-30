import React, { ReactElement } from 'react';
import {
  BookmarkIcon,
  EyeIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
} from '../icons';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SearchExperiment } from '../../lib/featureValues';

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
  const searchValue = useFeature(feature.search);
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
      title:
        searchValue === SearchExperiment.Control
          ? 'Reading history'
          : 'History',
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
