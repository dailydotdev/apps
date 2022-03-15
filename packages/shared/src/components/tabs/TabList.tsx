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
            'p-4 text-center typo-callout',
            tab === active ? 'font-bold' : 'text-theme-label-tertiary',
          )}
          onClick={() => onClick(tab)}
          type="button"
          role="menuitem"
        >
          {tab}
        </button>
      ))}
    </ul>
  );
}

export default TabList;
