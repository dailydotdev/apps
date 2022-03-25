import classNames from 'classnames';
import React, { ReactElement } from 'react';

interface TabListProps {
  items: string[];
  active: string;
  onClick?: (label: string) => unknown;
}

function TabList({ items, active, onClick }: TabListProps): ReactElement {
  return (
    <ul className="flex flex-row">
      {items.map((tab) => (
        <button
          key={tab}
          className={classNames(
            'relative p-4 text-center typo-callout',
            tab === active ? 'font-bold' : 'text-theme-label-tertiary',
          )}
          onClick={() => onClick(tab)}
          type="button"
          role="menuitem"
        >
          {tab}
          {tab === active && (
            <div
              className="absolute bottom-0 mx-auto w-4 h-px bg-theme-label-primary"
              style={{ left: 'calc(50% - 0.5rem)' }}
            />
          )}
        </button>
      ))}
    </ul>
  );
}

export default TabList;
