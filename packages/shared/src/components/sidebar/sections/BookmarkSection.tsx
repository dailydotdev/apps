import React, { ReactElement } from 'react';
import { ListIcon, SidebarMenuItem } from '../common';
import { ArrowIcon, BookmarkIcon, PlusIcon } from '../../icons';
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
import { useViewSize, ViewSize } from '../../../hooks';

export const BookmarkSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { openModal } = useLazyModal();
  const { folders } = useBookmarkFolderList();
  const { createFolder } = useCreateBookmarkFolder();

  const isLaptop = useViewSize(ViewSize.Laptop);
  const rightIcon = !isLaptop && (() => <ArrowIcon className="rotate-90" />);

  const onAddFolderClick = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    event.preventDefault();
    openModal({
      type: LazyModal.BookmarkFolder,
      props: {
        onSubmit: (folder) => {
          createFolder(folder);
        },
      },
    });
  };

  const menuItems: SidebarMenuItem[] = [
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
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BookmarkReminderIcon secondary={active} />} />
      ),
      title: 'Read it later',
      path: `${webappUrl}bookmarks/read-it-later`,
      isForcedLink: true,
      requiresLogin: true,
      rightIcon,
    },
    ...(folders ?? []).map((folder) => ({
      icon: folder.icon,
      title: folder.name,
      path: `${webappUrl}bookmarks/${folder.id}`,
      isForcedLink: true,
      requiresLogin: true,
      rightIcon,
    })),
    {
      icon: () => (
        <div className="rounded-6 bg-background-subtle">
          <PlusIcon aria-label="Add" />
        </div>
      ),
      title: 'New folder',
      requiresLogin: true,
      action: onAddFolderClick,
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
