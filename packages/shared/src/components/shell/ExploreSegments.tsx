import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useIsPhone } from '../../hooks/useViewSize';
import { featureInterestAgent } from '../../lib/featureManagement';
import { webappUrl } from '../../lib/constants';
import { withoutLayoutVariantPrefix } from '../../lib/layoutVariant';
import type { RowItem } from './ShellRow';
import { Segments, ShellRow } from './ShellRow';

interface ExploreTab {
  key: string;
  label: string;
  href: string;
  isActive: (path: string) => boolean;
}

const tabs: ExploreTab[] = [
  {
    key: 'posts',
    label: 'Posts',
    href: `${webappUrl}posts`,
    isActive: (path) =>
      path === '/posts' ||
      path === '/popular' ||
      path === '/upvoted' ||
      path.startsWith('/posts/'),
  },
  {
    key: 'discussions',
    label: 'Discussions',
    href: `${webappUrl}discussed`,
    isActive: (path) => path === '/discussed',
  },
  {
    key: 'tags',
    label: 'Tags',
    href: `${webappUrl}tags`,
    isActive: (path) => path === '/tags',
  },
  {
    key: 'sources',
    label: 'Sources',
    href: `${webappUrl}sources`,
    isActive: (path) => path === '/sources',
  },
];

const agents: ExploreTab = {
  key: 'agents',
  label: 'Agents',
  href: `${webappUrl}agent`,
  isActive: (path) => path === '/agent',
};

const leaderboard: ExploreTab = {
  key: 'leaderboard',
  label: 'Leaderboard',
  href: `${webappUrl}users`,
  isActive: (path) => path === '/users',
};

// Explore's places as the row of segments its block carries on every one
// of them, the way Home carries its feeds: the menu never leaves the screen.
export function ExploreSegments(): ReactElement {
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();
  const isPhone = useIsPhone();
  const { value: showAgents } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate: isLoggedIn && isPhone,
  });
  const path = withoutLayoutVariantPrefix(router?.pathname ?? '');
  const items: RowItem[] = (
    showAgents ? [...tabs, agents, leaderboard] : [...tabs, leaderboard]
  ).map((tab) => ({
    key: tab.key,
    label: tab.label,
    href: tab.href,
    active: tab.isActive(path),
    replace: true,
  }));

  return (
    <ShellRow>
      <Segments items={items} />
    </ShellRow>
  );
}
