import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export type LiveRoomSidePanelTab = 'chat' | 'queue' | 'audience';

interface LiveRoomSidePanelTabsProps {
  active: LiveRoomSidePanelTab;
  tabs: { id: LiveRoomSidePanelTab; label: string; count?: number }[];
  onChange: (tab: LiveRoomSidePanelTab) => void;
}

export const LiveRoomSidePanelTabs = ({
  active,
  tabs,
  onChange,
}: LiveRoomSidePanelTabsProps): ReactElement => (
  <div
    role="tablist"
    aria-label="Standup side panel"
    className="flex items-center gap-0.5 border-b border-border-subtlest-tertiary p-0.5 tablet:gap-1 tablet:p-1"
  >
    {tabs.map((tab) => {
      const isActive = tab.id === active;

      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(tab.id)}
          className={classNames(
            'flex flex-1 items-center justify-center gap-1.5 rounded-8 px-2 py-1 transition-colors typo-footnote tablet:gap-2 tablet:rounded-10 tablet:px-3 tablet:py-2 tablet:typo-callout',
            isActive
              ? 'bg-surface-float font-bold text-text-primary'
              : 'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
          )}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 ? (
            <span
              className={classNames(
                'rounded-full px-1.5 typo-caption2',
                isActive
                  ? 'bg-action-upvote-float text-action-upvote-default'
                  : 'bg-surface-float text-text-tertiary',
              )}
            >
              {tab.count}
            </span>
          ) : null}
        </button>
      );
    })}
  </div>
);
