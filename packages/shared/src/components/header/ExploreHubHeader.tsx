import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { PageHeader } from '../layout/PageHeader';

// Shared v2 header for the Explore hub's directory pages (Tags, Sources,
// Leaderboard, Best of). The section tabs now live in the sidebar's Explore
// panel, so this only renders when a page supplies header actions (e.g. the
// "Suggest source" button) — otherwise there's no header strip at all.
export function ExploreHubHeader({
  children,
}: {
  children?: ReactNode;
}): ReactElement | null {
  if (!children) {
    return null;
  }

  return <PageHeader className="justify-end !py-0">{children}</PageHeader>;
}
