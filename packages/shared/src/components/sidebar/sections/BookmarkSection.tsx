import type { ReactElement } from 'react';
import React from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { ArrowIcon, BookmarkIcon, BriefIcon, PlusIcon } from '../../icons';
import { Section } from '../Section';
import { briefingUrl, webappUrl } from '../../../lib/constants';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import type { SidebarSectionProps } from './common';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { BookmarkReminderIcon } from '../../icons/Bookmark/Reminder';
import {
  useBookmarkFolderList,
  useCreateBookmarkFolder,
} from '../../../hooks/bookmark';
import { useViewSize, ViewSize } from '../../../hooks';
import { FolderIcon } from '../../icons/Folder';
import { briefUIFeature } from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';

export const BookmarkSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const briefUIFeatureValue = useFeature(briefUIFeature);
  const { openModal, closeModal } = useLazyModal();
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
        onSubmit: async (folder) => {
          await createFolder(folder);
          closeModal();
        },
      },
    });
  };

  const menuItems: SidebarMenuItem[] = [
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
      path: `${webappUrl}bookmarks/later`,
      isForcedLink: true,
      requiresLogin: true,
      rightIcon,
    },
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
  ].filter(Boolean);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.BookmarksExpanded}
      isAlwaysOpenOnMobile
    />
  );
};
