import React, { ReactElement } from 'react';
import { SidebarMenuItem } from '../common';
import { PlusIcon } from '../../icons';
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

        openModal({ type: LazyModal.BookmarkFolderSoon, props: {} });
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
