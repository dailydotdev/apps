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
import { Image, ImageType } from '../../image/Image';
import { Section } from '../Section';
import { SidebarSettingsFlags } from '../../../graphql/settings';
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

  // Both hooks self-disable when handed an empty id/handle, so only the row's
  // matching entity is fetched.
  const { squad } = useSquad({ handle: type === 'squad' ? handle : '' });
  const { data: otherUser } = useUserShortByIdQuery({
    id: type === 'user' && !isOwnProfile ? handle : '',
  });

  let image: string | undefined;
  if (isOwnProfile) {
    image = user?.image;
  } else if (type === 'user') {
    image = otherUser?.image;
  } else if (type === 'squad') {
    image = squad?.image;
  }

  if (image) {
    return (
      <Image
        src={image}
        type={type === 'squad' ? ImageType.Squad : ImageType.Avatar}
        alt=""
        aria-hidden
        className="size-5 rounded-full object-cover"
      />
    );
  }

  return <ListIcon Icon={() => iconForType(type)} />;
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
