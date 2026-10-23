import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Segments, ShellRow } from '../../shell/ShellRow';
import {
  chipActiveClass,
  chipBaseClass,
  chipInactiveClass,
} from '../../feeds/UnifiedMobileFeedNav';
import { SquadDirectoryNavbarItem } from '../../squads/layout/SquadDirectoryNavbarItem';
import { ButtonSize } from '../../buttons/Button';
import { pageHeaderClassName } from '../../layout/PageHeader';

export interface PostPageFeedTab {
  id: string;
  label: string;
}

interface PostPageFeedTabsProps {
  tabs: PostPageFeedTab[];
  activeId: string;
  onSelect: (tab: PostPageFeedTab) => void;
}

/**
 * The post page feed's tabs, in the home feed's own recipe at each width.
 * All three render and CSS picks one, so the server render never jumps.
 *
 * - phone: HomeSegments (ShellRow + Segments), pinned under the shell block;
 * - tablet: UnifiedMobileFeedNav's chip strip;
 * - laptop: the page header strip with the tab ExploreChipsBar and the
 *   Squads directory share (SquadDirectoryNavbarItem).
 */
export function PostPageFeedTabs({
  tabs,
  activeId,
  onSelect,
}: PostPageFeedTabsProps): ReactElement {
  return (
    <>
      <div className="sticky top-[var(--shell-top,0rem)] z-1 bg-background-default tablet:hidden">
        <ShellRow>
          <Segments
            items={tabs.map((tab) => ({
              key: tab.id,
              label: tab.label,
              active: tab.id === activeId,
              onClick: () => onSelect(tab),
            }))}
          />
        </ShellRow>
      </div>

      <div className="hidden w-full items-stretch border-b border-border-subtlest-tertiary tablet:flex laptop:hidden">
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-3 py-4">
          {tabs.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(tab)}
                className={classNames(
                  chipBaseClass,
                  isActive ? chipActiveClass : chipInactiveClass,
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* The first label lines up with the post's text: the strip's inset is
          the column's 32px minus a small button's 12px. */}
      <div
        className={classNames(
          pageHeaderClassName,
          'hidden !px-5 !py-0 laptop:flex',
        )}
      >
        <div className="relative min-w-0 flex-1">
          <ul className="no-scrollbar flex items-center gap-2 overflow-x-auto pr-12">
            {tabs.map((tab) => (
              <SquadDirectoryNavbarItem
                key={tab.id}
                buttonSize={ButtonSize.Small}
                isActive={tab.id === activeId}
                label={tab.label}
                ariaLabel={tab.label}
                capitalize={false}
                onClick={() => onSelect(tab)}
                elementProps={{ className: 'flex shrink-0 items-center' }}
              />
            ))}
          </ul>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default" />
        </div>
      </div>
    </>
  );
}
