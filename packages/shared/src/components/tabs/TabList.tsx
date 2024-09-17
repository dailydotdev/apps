import classNames from 'classnames';
import React, {
  ReactElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { RenderTab } from './common';
import type { TabProps } from './TabContainer';

export type AllowedTabTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;

interface ClassName {
  indicator?: string;
  item?: string;
}

interface DimensionProps {
  activeTabRect?: DOMRect;
  offset: number;
  indicatorOffset: number;
}
export interface TabListProps<T extends string = string> {
  items: Pick<TabProps<T>, 'label' | 'url'>[];
  active: T;
  onClick?: (label: T) => unknown;
  className?: ClassName;
  autoScrollActive?: boolean;
  renderTab?: RenderTab;
  tag?: AllowedTabTags;
}

function TabList<T extends string = string>({
  items,
  active,
  onClick,
  className = {},
  autoScrollActive,
  renderTab,
  tag: Tag = 'button',
}: TabListProps<T>): ReactElement {
  const labels = items.map((item) => item.label);
  const hasActive = labels.includes(active);
  const currentActiveTab = useRef<HTMLButtonElement>(null);
  const [dimensions, setDimensions] = useState<DimensionProps>({
    offset: 0,
    indicatorOffset: 0,
  });
  const isAnchor = Tag === 'a';

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
      {items.map(({ label, url: href }) => {
        const isActive = label === active;
        const renderedTab = renderTab?.({ label, isActive }) ?? (
          <span
            className={classNames(
              'inline rounded-10 px-3 py-1.5',
              isActive && 'bg-theme-active',
            )}
          >
            {label}
          </span>
        );

        return (
          <Tag
            key={label}
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
              isAnchor && 'cursor-pointer',
            )}
            onClick={(event) => {
              if (isAnchor) {
                event.preventDefault();
              }
              onClick(label);
            }}
            {...(isAnchor
              ? {
                  'aria-label': label,
                  title: label,
                  ...(href ? { href } : {}),
                }
              : { type: 'button', role: 'menuitem' })}
          >
            {renderedTab}
          </Tag>
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
