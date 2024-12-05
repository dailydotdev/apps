import React, { ReactElement } from 'react';
import { ListIcon, SidebarMenuItem } from '../common';
import { BookmarkIcon, PlusIcon } from '../../icons';
import { Section } from '../Section';
import { webappUrl } from '../../../lib/constants';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { SidebarSectionProps } from './common';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';

export const BookmarkSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { openModal } = useLazyModal();

  const menuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <BookmarkIcon secondary={active} />} />
      ),
      title: 'Bookmarks',
      path: `${webappUrl}bookmarks`,
      isForcedLink: true,
      requiresLogin: true,
    },
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
          type: LazyModal.BookmarkFolder,
          props: {
            onSubmit: () => {},
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
