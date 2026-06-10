import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

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
    <div
      aria-hidden
      className="via-accent-cabbage-default/40 pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent"
    />
    <div
      role="tablist"
      aria-label="Giveback sections"
      className="flex overflow-x-auto"
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
              'relative shrink-0 whitespace-nowrap p-2 py-4 text-center font-normal transition-colors duration-200 typo-callout active:scale-95',
              selected
                ? 'text-text-primary'
                : 'text-text-tertiary hover:text-text-primary',
            )}
          >
            <span
              className={classNames(
                'flex flex-row items-center gap-1 rounded-10 border px-3 py-1.5 transition-colors duration-200',
                selected
                  ? 'border-border-subtlest-secondary'
                  : 'border-transparent hover:border-border-subtlest-tertiary',
              )}
            >
              {tab.label}
            </span>
            {selected && (
              <span
                aria-hidden
                className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-4 bg-text-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  </div>
);
