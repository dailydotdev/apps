import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import {
  HashtagIcon,
  SourceIcon,
  SquadIcon,
  TimerIcon,
  UserIcon,
} from '../../icons';
import { Section } from '../Section';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import type { SidebarSectionProps } from './common';
import type { RecentPage, RecentPageType } from '../../../lib/recentPages';
import { useRecentPages } from '../../../hooks/useRecentPages';

// Older stored entries predate `type`; fall back to the path prefix so they
// still get a recognizable icon until they're re-recorded with a type.
const resolveType = (page: RecentPage): RecentPageType => {
  if (page.type) {
    return page.type;
  }
  if (page.path.startsWith('/tags/')) {
    return 'tag';
  }
  if (page.path.startsWith('/sources/')) {
    return 'source';
  }
  if (page.path.startsWith('/squads/')) {
    return 'squad';
  }
  return 'page';
};

const iconForType = (type: RecentPageType): ReactElement => {
  switch (type) {
    case 'user':
      return <UserIcon />;
    case 'source':
      return <SourceIcon />;
    case 'squad':
      return <SquadIcon />;
    case 'tag':
      return <HashtagIcon />;
    default:
      return <TimerIcon />;
  }
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
        icon: () => <ListIcon Icon={() => iconForType(resolveType(page))} />,
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
