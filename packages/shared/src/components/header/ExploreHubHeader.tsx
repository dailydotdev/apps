import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { PageHeader } from '../layout/PageHeader';
import { ExploreSectionTabs } from './ExploreSectionTabs';

// Shared v2 header for the Explore hub's directory pages (Tags, Sources,
// Leaderboard, Best of). Keeps the section-tab strip and its height
// (`!py-0`) consistent in one place. Optional children render as header
// actions (e.g. the "Suggest source" button).
export function ExploreHubHeader({
  children,
}: {
  children?: ReactNode;
}): ReactElement {
  return (
    <PageHeader title={<ExploreSectionTabs />} className="!py-0">
      {children}
    </PageHeader>
  );
}
