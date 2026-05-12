import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import {
  EarthIcon,
  HashtagIcon,
  HotIcon,
  SquadIcon,
  UserIcon,
} from '../../icons';
import { Section } from '../Section';
import type { SidebarSectionProps } from './common';
import {
  useRecentPages,
  type RecentPageKind,
} from '../../../hooks/feed/useRecentPages';
import { SidebarSettingsFlags } from '../../../graphql/settings';

const iconByKind: Record<
  RecentPageKind,
  React.ComponentType<{ secondary?: boolean; className?: string }>
> = {
  squad: SquadIcon,
  tag: HashtagIcon,
  source: EarthIcon,
  feed: HotIcon,
  user: UserIcon,
};

export const RecentSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement | null => {
  const pages = useRecentPages();

  const menuItems: SidebarMenuItem[] = useMemo(
    () =>
      pages.map((page) => {
        const Icon = iconByKind[page.kind];
        const isActive = defaultRenderSectionProps.activePage === page.path;
        return {
          title: page.title,
          path: page.path,
          icon: () => <ListIcon Icon={() => <Icon secondary={isActive} />} />,
          active: isActive,
        };
      }),
    [pages, defaultRenderSectionProps.activePage],
  );

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.RecentExpanded}
    />
  );
};
