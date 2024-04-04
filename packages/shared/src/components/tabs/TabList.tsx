import classNames from 'classnames';
import React, { ReactElement, useEffect, useRef, useState } from 'react';

interface ClassName {
  indicator?: string;
  item?: string;
}

export interface TabListProps {
  items: string[];
  active: string;
  onClick?: (label: string) => unknown;
  className?: ClassName;
  autoScrollActive?: boolean;
}

function TabList({
  items,
  active,
  onClick,
  className = {},
  autoScrollActive,
}: TabListProps): ReactElement {
  const [offset, setOffset] = useState<number>(0);
  const [indicatorOffset, setIndicatorOffset] = useState<number>(undefined);
  const currentActiveTab = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoScrollActive && currentActiveTab.current) {
      currentActiveTab.current.parentElement.parentElement.scrollTo({
        left: offset,
        behavior: 'smooth',
      });
    }
  }, [offset, autoScrollActive]);

  return (
    <ul className="relative flex flex-row">
      {items.map((tab) => (
        <button
          key={tab}
          ref={async (el) => {
            if (!el || tab !== active) {
              return;
            }

            currentActiveTab.current = el;
            const rect = el.getBoundingClientRect();

            if (rect.width === 0) {
              return;
            }

            const size = rect.width;
            const leftOffset = el.offsetLeft;
            setOffset(leftOffset);
            setIndicatorOffset(size / 2 + leftOffset);
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
      {indicatorOffset !== undefined && (
        <div
          className={classNames(
            'absolute bottom-0 mx-auto h-0.5 w-12 -translate-x-1/2 rounded-4 bg-text-primary transition-[left] ease-linear',
            className?.indicator,
          )}
          style={{ left: indicatorOffset }}
        />
      )}
    </ul>
  );
}

export default TabList;
