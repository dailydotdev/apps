import classNames from 'classnames';
import React, { ReactElement, useState } from 'react';

interface TabListProps {
  items: string[];
  active: string;
  onClick?: (label: string) => unknown;
}

function TabList({ items, active, onClick }: TabListProps): ReactElement {
  const [offset, setOffset] = useState<number>(undefined);

  return (
    <ul className="flex relative flex-row">
      {items.map((tab) => (
        <button
          key={tab}
          ref={(el) => {
            if (!el || offset === el?.offsetLeft || tab !== active) return;

            const value = el.getBoundingClientRect().width / 2 + el.offsetLeft;
            setOffset(value);
          }}
          className={classNames(
            'relative p-4 text-center typo-callout font-bold',
            tab === active ? '' : 'text-theme-label-tertiary',
          )}
          onClick={() => onClick(tab)}
          type="button"
          role="menuitem"
        >
          <span
            className={classNames(
              'py-1.5 px-3 rounded-10',
              tab === active && 'bg-theme-active',
            )}
          >
            {tab}
          </span>
        </button>
      ))}
      <div
        className="absolute bottom-0 mx-auto w-16 h-0.5 rounded ease-linear -translate-x-1/2 transition-[left] bg-theme-label-primary"
        style={{ left: offset }}
      />
    </ul>
  );
}

export default TabList;
