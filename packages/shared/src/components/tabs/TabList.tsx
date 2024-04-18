import classNames from 'classnames';
import React, {
  ReactElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import TabLabel from './TabLabel';

interface ClassName {
  indicator?: string;
  item?: string;
}

interface DimensionProps {
  activeTabRect?: DOMRect;
  offset: number;
  indicatorOffset: number;
}
export interface TabListProps {
  items: string[];
  active: string;
  onClick?: (label: string) => unknown;
  className?: ClassName;
  autoScrollActive?: boolean;
  showActiveAsH1?: boolean;
}

function TabList({
  items,
  active,
  onClick,
  className = {},
  autoScrollActive,
  showActiveAsH1 = false,
}: TabListProps): ReactElement {
  const hasActive = items.includes(active);
  const currentActiveTab = useRef<HTMLButtonElement>(null);
  const [dimensions, setDimensions] = useState<DimensionProps>({
    offset: 0,
    indicatorOffset: 0,
  });

  const scrollIfNotInView = useCallback(() => {
    const { activeTabRect, offset } = dimensions;
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
  }, [autoScrollActive, dimensions]);

  useLayoutEffect(() => {
    // get the active tab's rect and offset so that we can position the indicator
    const activeTabRect = currentActiveTab.current?.getBoundingClientRect();
    const offset = activeTabRect ? currentActiveTab?.current.offsetLeft : 0;
    const indicatorOffset = activeTabRect
      ? activeTabRect.width / 2 + offset
      : 0;

    setDimensions((current) => {
      if (
        current.activeTabRect === activeTabRect &&
        current.offset === offset &&
        current.indicatorOffset === indicatorOffset
      ) {
        return current;
      }

      return {
        ...current,
        activeTabRect,
        offset,
        indicatorOffset,
      };
    });
  }, [active, setDimensions]);

  useLayoutEffect(() => {
    scrollIfNotInView();
  }, [scrollIfNotInView]);

  const { indicatorOffset } = dimensions;

  return (
    <ul className="relative flex flex-row">
      {items.map((tab) => {
        const isActive = tab === active;

        return (
          <button
            key={tab}
            ref={(el) => {
              if (!el || !isActive) {
                return;
              }

              currentActiveTab.current = el;
            }}
            className={classNames(
              className.item,
              'relative p-2 py-4 text-center font-bold typo-callout',
              isActive ? '' : 'text-text-tertiary',
            )}
            onClick={() => onClick(tab)}
            type="button"
            role="menuitem"
          >
            <TabLabel
              label={tab}
              isActive={isActive}
              showActiveAsH1={showActiveAsH1}
            />
          </button>
        );
      })}
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
