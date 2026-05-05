import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { RaiseHandIcon } from '../icons/RaiseHand';
import { IconSize } from '../Icon';

export type LiveRoomSidePanelTab = 'chat' | 'queue' | 'audience';

interface LiveRoomSidePanelTabsProps {
  active: LiveRoomSidePanelTab;
  tabs: { id: LiveRoomSidePanelTab; label: string; count?: number }[];
  onChange: (tab: LiveRoomSidePanelTab) => void;
  attentionTabId?: LiveRoomSidePanelTab;
  hasAttention?: boolean;
}

export const LiveRoomSidePanelTabs = ({
  active,
  tabs,
  onChange,
  attentionTabId,
  hasAttention = false,
}: LiveRoomSidePanelTabsProps): ReactElement => (
  <div
    role="tablist"
    aria-label="Standup side panel"
    className="flex items-center gap-0.5 border-b border-border-subtlest-tertiary p-0.5 tablet:gap-1 tablet:p-1"
  >
    {tabs.map((tab) => {
      const isActive = tab.id === active;
      const showAttention =
        hasAttention && attentionTabId === tab.id && !isActive;

      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(tab.id)}
          className={classNames(
            'relative flex flex-1 items-center justify-center gap-1.5 rounded-8 px-2 py-1 transition-colors typo-footnote tablet:gap-2 tablet:rounded-10 tablet:px-3 tablet:py-2 tablet:typo-callout',
            isActive && 'bg-surface-float font-bold text-text-primary',
            !isActive &&
              !showAttention &&
              'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
            showAttention &&
              'bg-status-warning font-bold text-white hover:brightness-110',
          )}
        >
          {showAttention ? (
            <RaiseHandIcon
              secondary
              size={IconSize.XSmall}
              className="origin-bottom animate-queue-attention-wave"
            />
          ) : null}
          {tab.label}
          {tab.count !== undefined && tab.count > 0 ? (
            <span
              className={classNames(
                'rounded-full px-1.5 typo-caption2',
                showAttention && 'bg-white text-status-warning',
                !showAttention && isActive
                  ? 'bg-action-upvote-float text-action-upvote-default'
                  : null,
                !showAttention && !isActive
                  ? 'bg-surface-float text-text-tertiary'
                  : null,
              )}
            >
              {tab.count}
            </span>
          ) : null}
          {showAttention ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 animate-queue-attention rounded-8 tablet:rounded-10"
            />
          ) : null}
        </button>
      );
    })}
  </div>
);
