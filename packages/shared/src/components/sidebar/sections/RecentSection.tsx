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
  type RecentPage,
  type RecentPageKind,
} from '../../../hooks/feed/useRecentPages';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useFeeds } from '../../../hooks';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { SquadImage } from '../../squads/SquadImage';
import { Image, ImageType } from '../../image/Image';
import type { Feed } from '../../../graphql/feed';
import type { Squad } from '../../../graphql/sources';

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

const getPathSegment = (path: string, segment: string): string | undefined => {
  const parts = path.split(/[?#]/)[0]?.split('/').filter(Boolean) ?? [];
  const segmentIndex = parts.indexOf(segment);
  const value = parts[segmentIndex + 1];
  return value ? decodeURIComponent(value) : undefined;
};

const getSquadHandle = (page: RecentPage): string | undefined => {
  if (page.entity?.type === 'squad') {
    return page.entity.handle;
  }

  return getPathSegment(page.path, 'squads');
};

const getFeed = (
  page: RecentPage,
  feedByIdOrSlug: Map<string, Feed>,
): Feed | undefined => {
  const slugOrId = getPathSegment(page.path, 'feeds');
  if (!slugOrId) {
    return undefined;
  }

  return feedByIdOrSlug.get(slugOrId);
};

const RecentSourceImage = ({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}): ReactElement => (
  <Image
    src={src ?? undefined}
    alt={alt}
    type={ImageType.Squad}
    className="h-5 w-5 rounded-full object-cover"
    loading="lazy"
  />
);

const getPageTitle = (
  page: RecentPage,
  squadByHandle: Map<string, Squad>,
  feedByIdOrSlug: Map<string, Feed>,
): string => {
  if (page.entity?.name) {
    return page.entity.name;
  }

  if (page.kind === 'squad') {
    const handle = getSquadHandle(page);
    const squad = handle ? squadByHandle.get(handle.toLowerCase()) : undefined;
    return squad?.name ?? page.title;
  }

  if (page.kind === 'feed') {
    const feed = getFeed(page, feedByIdOrSlug);
    return feed?.flags?.name || page.title;
  }

  return page.title;
};

const getPageIcon = ({
  page,
  isActive,
  squadByHandle,
  feedByIdOrSlug,
}: {
  page: RecentPage;
  isActive: boolean;
  squadByHandle: Map<string, Squad>;
  feedByIdOrSlug: Map<string, Feed>;
}): SidebarMenuItem['icon'] => {
  const { entity } = page;

  if (entity?.type === 'user') {
    return (
      <ProfilePicture
        user={{
          image: entity.image ?? '',
          name: entity.name ?? page.title,
          username: entity.username,
        }}
        size={ProfileImageSize.XSmall}
        rounded="full"
        nativeLazyLoading
      />
    );
  }

  if (page.kind === 'squad') {
    const handle = getSquadHandle(page);
    const squad = handle ? squadByHandle.get(handle.toLowerCase()) : undefined;

    if (squad || handle) {
      return (
        <SquadImage
          className="h-5 w-5"
          handle={squad?.handle ?? handle ?? ''}
          image={squad?.image ?? page.entity?.image}
          name={squad?.name ?? page.entity?.name ?? page.title}
        />
      );
    }
  }

  if (entity?.type === 'source') {
    return (
      <RecentSourceImage
        src={entity.image}
        alt={`${entity.name ?? page.title} logo`}
      />
    );
  }

  if (page.kind === 'feed') {
    const feed = getFeed(page, feedByIdOrSlug);
    if (feed?.flags?.icon) {
      return feed.flags.icon;
    }
  }

  const Icon = iconByKind[page.kind];
  return <ListIcon Icon={() => <Icon secondary={isActive} />} />;
};

export const RecentSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement | null => {
  const pages = useRecentPages();
  const { squads } = useAuthContext();
  const { feeds } = useFeeds();

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const squadByHandle = new Map(
      squads?.map((squad) => [squad.handle.toLowerCase(), squad]) ?? [],
    );
    const feedByIdOrSlug = new Map<string, Feed>();
    feeds?.edges.forEach(({ node }) => {
      feedByIdOrSlug.set(node.id, node);
      feedByIdOrSlug.set(node.slug, node);
    });

    return pages.map((page) => {
      const isActive = defaultRenderSectionProps.activePage === page.path;
      return {
        title: getPageTitle(page, squadByHandle, feedByIdOrSlug),
        path: page.path,
        icon: getPageIcon({
          page,
          isActive,
          squadByHandle,
          feedByIdOrSlug,
        }),
        active: isActive,
      };
    });
  }, [pages, squads, feeds?.edges, defaultRenderSectionProps.activePage]);

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
