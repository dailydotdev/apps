import type { ReactElement } from 'react';
import React from 'react';
import TabList, { TabListVariant } from '../../../components/tabs/TabList';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { InfoIcon } from '../../../components/icons';

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
  // Re-opens the warm-up funnel; rendered as a button on the right of the strip.
  onHowItWorks?: () => void;
}

// Sticky section nav for the onboarded experience. Spans the full content width
// with a glass background, then re-centers the shared bordered TabList to the
// page column. Full-bleed via `w-full` of the content area (not `w-screen`) so
// it never overflows or misaligns next to the app sidebar.
export const GivebackTabNav = ({
  activeTab,
  onSelect,
  onHowItWorks,
}: GivebackTabNavProps): ReactElement => {
  const activeLabel =
    givebackTabs.find((tab) => tab.id === activeTab)?.label ?? '';

  return (
    <div className="bg-background-default/80 sticky top-0 z-3 w-full border-b border-border-subtlest-tertiary backdrop-blur-xl">
      <div
        aria-hidden
        className="via-accent-cabbage-default/40 pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4">
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
        {onHowItWorks && (
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            icon={<InfoIcon />}
            className="shrink-0"
            onClick={onHowItWorks}
          >
            How it works
          </Button>
        )}
      </div>
    </div>
  );
};
