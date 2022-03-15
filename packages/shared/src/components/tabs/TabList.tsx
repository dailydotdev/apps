import classNames from 'classnames';
import React, { ReactElement } from 'react';

interface TabListProps {
  items: string[];
  active: number;
  onClick?: (index: number) => unknown;
}

function TabList({ items, active, onClick }: TabListProps): ReactElement {
  return (
    <ul className="flex flex-row">
      {items.map((tab, index) => (
        <button
          key={tab}
          className={classNames(
            'p-4 text-center typo-callout',
            active === index ? 'font-bold' : 'text-theme-label-tertiary',
          )}
          onClick={() => onClick(index)}
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
