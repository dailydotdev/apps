import React, { ReactElement } from 'react';
import { ListIcon, SidebarMenuItem } from '../common';
import { BookmarkIcon, PlusIcon } from '../../icons';
import { Section } from '../Section';
import { webappUrl } from '../../../lib/constants';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { SidebarSectionProps } from './common';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { BookmarkReminderIcon } from '../../icons/Bookmark/Reminder';
import {
  useBookmarkFolderList,
  useCreateBookmarkFolder,
} from '../../../hooks/bookmark';

export const BookmarkSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { openModal } = useLazyModal();
  const { folders } = useBookmarkFolderList();
  const { createFolder } = useCreateBookmarkFolder();

  const menuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BookmarkIcon secondary={active} />} />
      ),
      title: 'Quick saves',
      path: `${webappUrl}bookmarks`,
      isForcedLink: true,
      requiresLogin: true,
    },
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BookmarkReminderIcon secondary={active} />} />
      ),
      title: 'Read it later',
      path: `${webappUrl}bookmarks/read-it-later`,
      isForcedLink: true,
      requiresLogin: true,
    },
    ...(folders ?? []).map((folder) => ({
      icon: folder.icon,
      title: folder.name,
      path: `${webappUrl}bookmarks/${folder.id}`,
      isForcedLink: true,
      requiresLogin: true,
    })),
    {
      icon: () => (
        <div className="rounded-6 bg-background-subtle">
          <PlusIcon />
        </div>
      ),
      title: 'New folder',
      path: `${webappUrl}bookmarks/new`,
      isForcedLink: true,
      requiresLogin: true,
      action: (
        event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
      ) => {
        event.preventDefault();

        openModal({
          type: LazyModal.BookmarkFolderSoon,
          props: {
            onAfterClose() {
              createFolder({
                name: 'New folder',
                icon: '🚀',
              });
            },
          },
        });
      },
    },
  ];

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.BookmarksExpanded}
    />
  );
};
