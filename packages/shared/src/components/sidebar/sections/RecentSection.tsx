import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import {
  AnalyticsIcon,
  BellIcon,
  BookmarkIcon,
  BriefIcon,
  CompassIcon,
  HashtagIcon,
  HomeIcon,
  HotIcon,
  JobIcon,
  SettingsIcon,
  SourceIcon,
  SquadIcon,
  TimerIcon,
  UserIcon,
} from '../../icons';
import { Image, ImageType } from '../../image/Image';
import { Section } from '../Section';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { sourceQueryOptions } from '../../../graphql/sources';
import type { SidebarSectionProps } from './common';
import type { RecentPage, RecentPageType } from '../../../lib/recentPages';
import { useRecentPages } from '../../../hooks/useRecentPages';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSquad } from '../../../hooks/squads/useSquad';
import { useUserShortByIdQuery } from '../../../hooks/user/useUserShortByIdQuery';

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

const firstSegment = (path: string): string =>
  path.split('?')[0].split('#')[0].split('/').filter(Boolean)[0] ?? '';

// Recognizable glyphs for known internal destinations, keyed by the leading
// path segment, so a recent page reads as itself (Game Center, Settings,
// Notifications…) instead of the generic "history" timer. Anything unmapped
// (and any page with no better icon/image) keeps the timer fallback.
const PAGE_ICON_BY_SEGMENT: Record<string, () => ReactElement> = {
  'game-center': () => <HotIcon />,
  'daily-quests': () => <HotIcon />,
  settings: () => <SettingsIcon />,
  notifications: () => <BellIcon />,
  bookmarks: () => <BookmarkIcon />,
  briefing: () => <BriefIcon />,
  analytics: () => <AnalyticsIcon />,
  jobs: () => <JobIcon />,
  following: () => <HomeIcon />,
  posts: () => <CompassIcon />,
  squads: () => <SquadIcon />,
};

const iconForType = (page: RecentPage, type: RecentPageType): ReactElement => {
  switch (type) {
    case 'user':
      return <UserIcon />;
    case 'source':
      return <SourceIcon />;
    case 'squad':
      return <SquadIcon />;
    case 'tag':
      return <HashtagIcon />;
    default: {
      const makeIcon = PAGE_ICON_BY_SEGMENT[firstSegment(page.path)];
      return makeIcon ? makeIcon() : <TimerIcon />;
    }
  }
};

const handleFromPath = (path: string): string =>
  path.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() ?? '';

// Renders the real entity avatar (squad logo / profile picture) when we can
// resolve it — the entity is usually already cached from the visit — and falls
// back to the typed vector icon while loading or when it can't be resolved.
const RecentItemIcon = ({ page }: { page: RecentPage }): ReactElement => {
  const type = resolveType(page);
  const handle = handleFromPath(page.path);
  const { user } = useAuthContext();
  const isOwnProfile =
    type === 'user' && !!user?.username && handle === user.username;

  // Each query self-disables when handed an empty id/handle, so only the row's
  // matching entity is fetched.
  const { squad } = useSquad({ handle: type === 'squad' ? handle : '' });
  const { data: otherUser } = useUserShortByIdQuery({
    id: type === 'user' && !isOwnProfile ? handle : '',
  });
  const { data: source } = useQuery(
    sourceQueryOptions({ sourceId: type === 'source' ? handle : '' }),
  );

  let image: string | undefined;
  if (isOwnProfile) {
    image = user?.image;
  } else if (type === 'user') {
    image = otherUser?.image;
  } else if (type === 'squad') {
    image = squad?.image;
  } else if (type === 'source') {
    image = source?.image;
  }

  if (image) {
    return (
      <Image
        src={image}
        // Sources/squads are square logos; users are round avatars.
        type={type === 'user' ? ImageType.Avatar : ImageType.Squad}
        alt=""
        aria-hidden
        className="size-5 rounded-6 object-cover"
      />
    );
  }

  return <ListIcon Icon={() => iconForType(page, type)} />;
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
        icon: () => <RecentItemIcon page={page} />,
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
