import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { PageHeader } from '../layout/PageHeader';

// The Explore hub sections live in the sidebar's Explore panel, so the page
// header is just the standard title strip (same as Analytics / Settings) —
// no breadcrumb, no icon. The title is derived from the route.
const hubTitles: { match: (path: string) => boolean; label: string }[] = [
  { match: (path) => path.startsWith('/posts/best-of'), label: 'Best of' },
  { match: (path) => path.startsWith('/sources'), label: 'Sources' },
  { match: (path) => path.startsWith('/users'), label: 'Leaderboard' },
  { match: (path) => path.startsWith('/discussed'), label: 'Discussions' },
  { match: (path) => path.startsWith('/posts'), label: 'Explore' },
];

// Shared v2 header for the Explore hub's directory pages (Sources, Leaderboard,
// Best of). Optional children render as header actions (e.g. "Suggest source").
export function ExploreHubHeader({
  children,
}: {
  children?: ReactNode;
}): ReactElement {
  const router = useRouter();
  // asPath-first (the resolved URL) — consistent with FeedExploreTabs and
  // correct for dynamic routes where pathname is the template.
  const path = (router.asPath || router.pathname || '').split('?')[0];
  const title =
    hubTitles.find((entry) => entry.match(path))?.label ?? 'Explore';

  return (
    <PageHeader title={title} className="!py-0">
      {children}
    </PageHeader>
  );
}
