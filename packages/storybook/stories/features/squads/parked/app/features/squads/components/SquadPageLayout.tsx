import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import { SquadPreviewNotice } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadPreview';
import { SquadWidgets } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidgets';
import { SquadPageTab } from '../lib/routes';

const ABOUT = 'about';

type Tab = SquadPageTab | typeof ABOUT;

export interface SquadPageExtraTab {
  id: Exclude<SquadPageTab, SquadPageTab.Posts>;
  label: string;
  content: ReactNode;
}

interface SquadPageLayoutProps {
  /** The card's top: the profile header on the page, a title bar elsewhere. */
  header: ReactNode;
  /** Sits under the header on every width, above the tabs below laptop. */
  belowHeader?: ReactNode;
  children: ReactNode;
  /**
   * Below laptop the right column moves behind an About tab beside Posts.
   * It stays in the DOM either way, since crawlers read the phone render.
   */
  hasAboutTab?: boolean;
  /**
   * Tabs beside Posts (Jobs, Perks). From laptop they sit over the feed;
   * below laptop they join the Posts and About tabs.
   */
  tabs?: SquadPageExtraTab[];
  initialTab?: SquadPageTab;
  onTabChange?: (tab: SquadPageTab) => void;
}

const TabBar = ({
  items,
  active,
  label,
  onSelect,
}: {
  items: { id: Tab; label: string }[];
  active: Tab;
  label: string;
  onSelect: (tab: Tab) => void;
}): ReactElement => (
  <SquadDirectoryNavbar aria-label={label} className="!mx-0 !border-0 !px-0">
    {items.map((item) => (
      <SquadDirectoryNavbarItem
        key={item.id}
        buttonSize={ButtonSize.Small}
        isActive={active === item.id}
        label={item.label}
        ariaLabel={item.label}
        onClick={() => onSelect(item.id)}
      />
    ))}
  </SquadDirectoryNavbar>
);

// One right column for every width: from laptop it sits beside the card,
// below laptop the card's wrapper dissolves (`contents`) so the column can
// be ordered between the tabs and the posts.
export const SquadPageLayout = ({
  header,
  belowHeader,
  children,
  hasAboutTab = false,
  tabs = [],
  initialTab = SquadPageTab.Posts,
  onTabChange,
}: SquadPageLayoutProps): ReactElement => {
  const [selected, setTab] = useState<Tab>(initialTab);
  // A tab asked for in the URL may only appear once its data loads
  const tab: Tab =
    selected === ABOUT || tabs.some(({ id }) => id === selected)
      ? selected
      : SquadPageTab.Posts;
  const isAbout = hasAboutTab && tab === ABOUT;
  const extra = tabs.find(({ id }) => id === tab);
  const contentTabs = [
    { id: SquadPageTab.Posts, label: 'Posts' },
    ...tabs.map(({ id, label }) => ({ id, label })),
  ];
  const phoneTabs = hasAboutTab
    ? [...contentTabs, { id: ABOUT as Tab, label: 'About' }]
    : contentTabs;
  const onSelect = (next: Tab) => {
    setTab(next);
    if (next !== ABOUT) {
      onTabChange?.(next);
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
      <div className="contents laptop:flex laptop:min-w-0 laptop:flex-1 laptop:flex-col">
        <div className="order-1 flex flex-col">
          <SquadPreviewNotice />
          <div className="border-border-subtlest-tertiary laptop:rounded-t-16 laptop:border laptop:border-b-0">
            {header}
            {belowHeader}
          </div>
        </div>
        {(hasAboutTab || !!tabs.length) && (
          <div className="order-2 border-t border-border-subtlest-tertiary px-4 tablet:px-6 laptop:hidden">
            <TabBar
              items={phoneTabs}
              active={tab}
              label={
                tabs.length
                  ? phoneTabs.map((item) => item.label).join(', ')
                  : 'Posts and About'
              }
              onSelect={onSelect}
            />
          </div>
        )}
        <div
          className={classNames(
            'order-4 min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:flex laptop:rounded-b-16 laptop:border laptop:border-t-0',
            isAbout ? 'hidden' : 'flex',
          )}
        >
          {!!tabs.length && (
            <div className="hidden border-t border-border-subtlest-tertiary px-6 laptop:block">
              <TabBar
                items={contentTabs}
                active={tab}
                label={contentTabs.map((item) => item.label).join(', ')}
                onSelect={onSelect}
              />
            </div>
          )}
          {extra ? extra.content : children}
        </div>
      </div>
      <aside
        className={classNames(
          'order-3 w-full flex-col gap-4 px-4 pb-6 tablet:px-6 laptop:order-none laptop:flex laptop:w-80 laptop:shrink-0 laptop:p-0',
          isAbout ? 'flex' : 'hidden',
        )}
      >
        <SquadWidgets />
      </aside>
    </div>
  );
};
