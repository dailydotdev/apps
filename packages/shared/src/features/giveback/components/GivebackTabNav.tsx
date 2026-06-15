import type { ReactElement } from 'react';
import React from 'react';
import TabList, { TabListVariant } from '../../../components/tabs/TabList';

export type GivebackTabId = 'actions' | 'impact' | 'why';

interface GivebackTab {
  id: GivebackTabId;
  label: string;
}

export const givebackTabs: GivebackTab[] = [
  { id: 'actions', label: 'Take action' },
  { id: 'impact', label: 'Impact' },
  { id: 'why', label: 'Campaign' },
];

interface GivebackTabNavProps {
  activeTab: GivebackTabId;
  onSelect: (tab: GivebackTabId) => void;
}

// Sticky section nav for the onboarded experience. Spans the full content width
// with a glass background, then re-centers the shared bordered TabList to the
// page column. Full-bleed via `w-full` of the content area (not `w-screen`) so
// it never overflows or misaligns next to the app sidebar.
export const GivebackTabNav = ({
  activeTab,
  onSelect,
}: GivebackTabNavProps): ReactElement => {
  const activeLabel =
    givebackTabs.find((tab) => tab.id === activeTab)?.label ?? '';

  return (
    <div className="bg-background-default/80 sticky top-0 z-3 w-full border-b border-border-subtlest-tertiary backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-cabbage-default/40 to-transparent"
      />
      <div className="mx-auto w-full max-w-6xl px-4">
        <TabList
          items={givebackTabs.map((tab) => ({ label: tab.label }))}
          active={activeLabel}
          variant={TabListVariant.Bordered}
          onClick={(label) => {
            const tab = givebackTabs.find((item) => item.label === label);
            if (tab) {
              onSelect(tab.id);
            }
          }}
        />
      </div>
    </div>
  );
};
