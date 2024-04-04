import classNames from 'classnames';
import React, { ReactElement, useState } from 'react';

interface ClassName {
  indicator?: string;
  item?: string;
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
    <ul className="relative flex flex-row">
      {items.map((tab) => (
        <button
          key={tab}
          ref={async (el) => {
            if (!el || tab !== active) {
              return;
            }

            const rect = el.getBoundingClientRect();

            if (rect.width === 0) {
              return;
            }

            const size = rect.width / 2;
            const value = size + el.offsetLeft;
            setOffset(value);
          }}
          className={classNames(
            className.item,
            'relative p-2 py-4 text-center font-bold typo-callout',
            tab === active ? '' : 'text-text-tertiary',
          )}
          onClick={() => onClick(tab)}
          type="button"
          role="menuitem"
        >
          <span
            className={classNames(
              'rounded-10 px-3 py-1.5',
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
            'absolute bottom-0 mx-auto h-0.5 w-12 -translate-x-1/2 rounded-4 bg-text-primary transition-[left] ease-linear',
            className?.indicator,
          )}
          style={{ left: offset }}
        />
      )}
    </ul>
  );
}

export default TabList;
