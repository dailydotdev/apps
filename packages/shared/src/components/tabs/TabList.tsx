import classNames from 'classnames';
import React, { ReactElement, useCallback, useEffect, useRef } from 'react';

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
  const hasActive = items.includes(active);
  const currentActiveTab = useRef<HTMLButtonElement>(null);
  const activeTabRect = currentActiveTab.current?.getBoundingClientRect();
  const offset = activeTabRect ? currentActiveTab?.current.offsetLeft : 0;
  const indicatorOffset = activeTabRect ? activeTabRect.width / 2 + offset : 0;

  const scrollIfNotInView = useCallback(() => {
    if (autoScrollActive && currentActiveTab.current) {
      if (!activeTabRect) {
        return;
      }

      const scrollableParent =
        currentActiveTab.current.parentElement.parentElement;
      const scrollableParentRect = scrollableParent.getBoundingClientRect();

      if (
        activeTabRect.left < scrollableParentRect.left ||
        activeTabRect.right > scrollableParentRect.right
      ) {
        currentActiveTab.current.parentElement.parentElement.scrollTo({
          left: offset,
          behavior: 'smooth',
        });
      }
    }
  }, [autoScrollActive, activeTabRect, offset]);

  useEffect(() => {
    scrollIfNotInView();
  }, [scrollIfNotInView]);

  return (
    <ul className="relative flex flex-row">
      {items.map((tab) => (
        <button
          key={tab}
          ref={(el) => {
            if (!el || tab !== active) {
              return;
            }

            currentActiveTab.current = el;
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
      {!!indicatorOffset && hasActive && (
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
