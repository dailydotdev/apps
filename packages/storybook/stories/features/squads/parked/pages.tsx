import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { SquadPageLayout } from '@dailydotdev/shared/src/features/squads/components/SquadPageLayout';
import { SquadProfileHeader } from '@dailydotdev/shared/src/features/squads/components/header/SquadProfileHeader';
import { SquadProductsShelf } from '@dailydotdev/shared/src/features/squads/components/products/SquadProductsShelf';
import { useSquadPageTabs } from '@dailydotdev/shared/src/features/squads/hooks/useSquadPageTabs';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import type { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { SquadPageTab } from '@dailydotdev/shared/src/features/squads/lib/routes';

/**
 * The squad page as SquadHome builds it, with the feed swapped for a
 * placeholder: the header, the products row, Posts · Jobs · Perks.
 */
export const SquadPage = ({
  tab = SquadPageTab.Posts,
}: {
  tab?: SquadPageTab;
}): ReactElement => {
  const { tabs } = useSquadPageTabs();

  return (
    <SquadPageLayout
      header={<SquadProfileHeader />}
      belowHeader={<SquadProductsShelf />}
      hasAboutTab
      tabs={tabs}
      initialTab={tab}
    >
      <p className="p-6 text-text-tertiary typo-callout">
        The squad feed, unchanged.
      </p>
    </SquadPageLayout>
  );
};

/** A Manage section in the real Manage layout and menu. */
export const ManagePage = ({
  section,
  children,
}: {
  section: SquadManageSection;
  children: ReactNode;
}): ReactElement => (
  <SquadManageLayout section={section}>{children}</SquadManageLayout>
);
