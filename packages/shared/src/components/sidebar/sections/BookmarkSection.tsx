import type { ReactElement } from 'react';
import React from 'react';
import type { SidebarMenuItem } from '../common';
import {
  createSidebarAddItem,
  createSidebarSeparatorItem,
  ListIcon,
} from '../common';
import { ArrowIcon, BookmarkIcon, BriefIcon } from '../../icons';
import { Section } from '../Section';
import { briefingUrl, webappUrl } from '../../../lib/constants';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import type { SidebarSectionProps } from './common';
import { BookmarkReminderIcon } from '../../icons/Bookmark/Reminder';
import { useBookmarkFolderList } from '../../../hooks/bookmark';
import { useAddBookmarkFolder } from '../../../hooks/bookmark/useAddBookmarkFolder';
import { useViewSize, ViewSize } from '../../../hooks';
import { FolderIcon } from '../../icons/Folder';
import { briefUIFeature } from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';

export const BookmarkSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const briefUIFeatureValue = useFeature(briefUIFeature);
  const { folders } = useBookmarkFolderList();
  const handleAddFolder = useAddBookmarkFolder();
  // v2 rail panels (`compact`) also expose the add action as a bottom row.
  const { compact } = defaultRenderSectionProps;

  const isLaptop = useViewSize(ViewSize.Laptop);
  const rightIcon = !isLaptop
    ? () => <ArrowIcon className="rotate-90" />
    : undefined;

  const allMenuItems = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BookmarkIcon secondary={active} />} />
      ),
      title: 'Quick saves',
      path: `${webappUrl}bookmarks`,
      isForcedLink: true,
      requiresLogin: true,
      rightIcon,
    },
    briefUIFeatureValue && {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BriefIcon secondary={active} />} />
      ),
      title: 'Presidential briefings',
      path: briefingUrl,
      isForcedLink: true,
      requiresLogin: true,
      rightIcon,
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BookmarkReminderIcon secondary={active} />} />
      ),
      title: 'Read it later',
      path: `${webappUrl}bookmarks/later`,
      isForcedLink: true,
      requiresLogin: true,
      rightIcon,
    },
    // New folder sits below the fixed entries; the user's folders list builds
    // up beneath it, separated by a border (mirrors the Squads panel).
    compact && createSidebarAddItem('New folder', { onClick: handleAddFolder }),
    (folders?.length ?? 0) > 0 &&
      compact &&
      createSidebarSeparatorItem('folders-divider'),
    ...(folders ?? []).map((folder) => ({
      icon:
        folder.icon ||
        ((active: boolean) => (
          <ListIcon Icon={() => <FolderIcon secondary={active} />} />
        )),
      title: folder.name,
      path: `${webappUrl}bookmarks/${folder.id}`,
      isForcedLink: true,
      requiresLogin: true,
      rightIcon,
    })),
  ];
  const menuItems: SidebarMenuItem[] = allMenuItems.filter(
    Boolean,
  ) as SidebarMenuItem[];

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.BookmarksExpanded}
      isAlwaysOpenOnMobile
      // v2 (`compact`) uses the leading "New folder" row instead of a header
      // "+"; v1 keeps its header add button.
      onAdd={compact ? undefined : handleAddFolder}
    />
  );
};
