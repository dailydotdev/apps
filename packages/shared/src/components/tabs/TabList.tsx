import classNames from 'classnames';
import React, { ReactElement, useState } from 'react';

interface ClassName {
  indicator?: string;
}

export interface TabListProps {
  items: string[];
  active: string;
  onClick?: (label: string) => unknown;
  className?: ClassName;
}

function TabList({
  items,
  active,
  onClick,
  className = {},
}: TabListProps): ReactElement {
  const [offset, setOffset] = useState<number>(undefined);

  return (
    <ul className="flex relative flex-row">
      {items.map((tab) => (
        <button
          key={tab}
          ref={async (el) => {
            if (!el || tab !== active) return;

            const rect = el.getBoundingClientRect();

            if (rect.width === 0) return;

            const size = rect.width / 2;
            const value = size + el.offsetLeft;
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
      {offset !== undefined && (
        <div
          className={classNames(
            'absolute bottom-0 mx-auto w-12 h-0.5 rounded transition-[left] ease-linear -translate-x-1/2 bg-theme-label-primary',
            className?.indicator,
          )}
          style={{ left: offset }}
        />
      )}
    </ul>
  );
}

export default TabList;
