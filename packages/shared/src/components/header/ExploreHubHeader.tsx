import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { PageHeader } from '../layout/PageHeader';
import { BreadCrumbs } from './BreadCrumbs';
import { IconSize } from '../Icon';
import type { IconProps } from '../Icon';
import {
  CompassIcon,
  DiscussIcon,
  EarthIcon,
  HashtagIcon,
  MedalBadgeIcon,
  SquadIcon,
} from '../icons';

type HubEntry = {
  label: string;
  Icon: (props: IconProps) => ReactElement;
  // Most specific paths first (e.g. /posts/best-of before /posts).
  match: (path: string) => boolean;
};

// The Explore hub sections now live in the sidebar's Explore panel; the page
// header keeps a consistent breadcrumb (Home / icon + title) so every hub page
// reads the same way as the rest of the app instead of going header-less.
const hubEntries: HubEntry[] = [
  {
    label: 'Best of',
    Icon: MedalBadgeIcon,
    match: (path) => path.startsWith('/posts/best-of'),
  },
  {
    label: 'Tags',
    Icon: HashtagIcon,
    match: (path) => path.startsWith('/tags'),
  },
  {
    label: 'Sources',
    Icon: EarthIcon,
    match: (path) => path.startsWith('/sources'),
  },
  {
    label: 'Leaderboard',
    Icon: SquadIcon,
    match: (path) => path.startsWith('/users'),
  },
  {
    label: 'Discussions',
    Icon: DiscussIcon,
    match: (path) => path.startsWith('/discussed'),
  },
  {
    label: 'Explore',
    Icon: CompassIcon,
    match: (path) => path.startsWith('/posts'),
  },
];

const defaultEntry: HubEntry = {
  label: 'Explore',
  Icon: CompassIcon,
  match: () => true,
};

export function ExploreHubBreadcrumb(): ReactElement {
  const router = useRouter();
  const path = (router.pathname || router.asPath || '').split('?')[0];
  const { label, Icon } =
    hubEntries.find((entry) => entry.match(path)) ?? defaultEntry;

  return (
    <BreadCrumbs>
      <Icon size={IconSize.XSmall} secondary />
      {label}
    </BreadCrumbs>
  );
}

// Shared v2 header for the Explore hub's directory pages (Tags, Sources,
// Leaderboard, Best of). Optional children render as header actions (e.g. the
// "Suggest source" button).
export function ExploreHubHeader({
  children,
}: {
  children?: ReactNode;
}): ReactElement {
  return (
    <PageHeader title={<ExploreHubBreadcrumb />} className="!py-0">
      {children}
    </PageHeader>
  );
}
