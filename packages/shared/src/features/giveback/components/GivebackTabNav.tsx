import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexRow } from '../../../components/utilities';

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

// Sticky section nav for the onboarded experience. Solid background (no blur)
// so it reads cleanly over scrolling content; rendered outside any animated
// reveal wrapper so `sticky` pins to the viewport rather than a transformed
// ancestor.
export const GivebackTabNav = ({
  activeTab,
  onSelect,
}: GivebackTabNavProps): ReactElement => (
  <div className="sticky top-0 z-3 -mx-4 border-b border-border-subtlest-tertiary bg-background-default px-4">
    <FlexRow
      role="tablist"
      aria-label="Giveback sections"
      className="gap-1 overflow-x-auto"
    >
      {givebackTabs.map((tab) => {
        const selected = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`giveback-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`giveback-panel-${tab.id}`}
            onClick={() => onSelect(tab.id)}
            className={classNames(
              'relative shrink-0 whitespace-nowrap px-3 py-4 font-medium transition-colors typo-callout',
              selected
                ? 'text-text-primary'
                : 'text-text-tertiary hover:text-text-primary',
            )}
          >
            {tab.label}
            {selected && (
              <span
                aria-hidden
                className="absolute inset-x-3 bottom-0 h-0.5 rounded-4 bg-text-primary"
              />
            )}
          </button>
        );
      })}
    </FlexRow>
  </div>
);
