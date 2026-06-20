import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { EarthIcon, HashtagIcon, SourceIcon } from '../../icons';
import { Section } from '../Section';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import type { SidebarSectionProps } from './common';
import { useRecentPages } from '../../../hooks/useRecentPages';

const iconForPath = (path: string): ReactElement => {
  if (path.startsWith('/tags/')) {
    return <HashtagIcon />;
  }
  if (path.startsWith('/sources/') || path.startsWith('/squads/')) {
    return <SourceIcon />;
  }
  return <EarthIcon />;
};

// v2 Home panel: the last few non-post pages the user visited (profiles,
// feeds, tags, sources, etc.). Hidden until there's something to show.
export const RecentSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement | null => {
  const recentPages = useRecentPages();

  const menuItems: SidebarMenuItem[] = useMemo(
    () =>
      recentPages.map((page) => ({
        icon: () => <ListIcon Icon={() => iconForPath(page.path)} />,
        title: page.title,
        path: page.path,
        // Recent mirrors pages you've already visited (often the current one),
        // so it should never render as the active nav item.
        disableActiveState: true,
      })),
    [recentPages],
  );

  if (!recentPages.length) {
    return null;
  }

  return (
    <Section
      {...defaultRenderSectionProps}
      title="Recent"
      items={menuItems}
      isItemsButton={false}
      flag={SidebarSettingsFlags.RecentExpanded}
    />
  );
};
