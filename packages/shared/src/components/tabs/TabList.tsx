import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { RenderTab } from './common';
import type { TabProps } from './TabContainer';

export type AllowedTabTags = keyof Pick<JSX.IntrinsicElements, 'a' | 'button'>;

export enum TabListVariant {
  // Solid fill behind the active tab (the long-standing look).
  Filled = 'filled',
  // Outlined pill around the active tab with a slimmer indicator.
  Bordered = 'bordered',
}

interface TabListVariantStyle {
  item: string;
  inactiveItem: string;
  pill: string;
  activePill: string;
  inactivePill: string;
  indicator: string;
}

const variantStyles: Record<TabListVariant, TabListVariantStyle> = {
  [TabListVariant.Filled]: {
    item: 'font-bold',
    inactiveItem: 'text-text-tertiary',
    pill: 'rounded-10 px-3 py-1.5',
    activePill: 'bg-theme-active',
    inactivePill: '',
    indicator: 'w-12',
  },
  [TabListVariant.Bordered]: {
    item: 'font-normal',
    inactiveItem: 'text-text-tertiary hover:text-text-primary',
    pill: 'rounded-10 border px-3 py-1.5 transition-colors duration-200',
    activePill: 'border-border-subtlest-secondary',
    inactivePill: 'border-transparent hover:border-border-subtlest-tertiary',
    indicator: 'w-6',
  },
};

interface ClassName {
  indicator?: string;
  item?: string;
}

interface DimensionProps {
  activeTabRect?: DOMRect;
  offset: number;
  indicatorOffset: number;
}

interface DragState {
  startClientX: number;
  startScrollLeft: number;
  didDrag: boolean;
}

export interface TabListProps<T extends string = string> {
  items: Pick<TabProps<T>, 'label' | 'url' | 'hint'>[];
  active: T;
  onClick?: (
    label: T,
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => unknown;
  className?: ClassName;
  autoScrollActive?: boolean;
  dragScroll?: boolean;
  renderTab?: RenderTab;
  tag?: AllowedTabTags;
  variant?: TabListVariant;
}

function TabList<T extends string = string>({
  items,
  active,
  onClick,
  className = {},
  autoScrollActive,
  dragScroll = false,
  renderTab,
  tag: Tag = 'button',
  variant = TabListVariant.Filled,
}: TabListProps<T>): ReactElement {
  const styles = variantStyles[variant];
  const labels = items.map((item) => item.label);
  const hasActive = labels.includes(active);
  const currentActiveTab = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const [dimensions, setDimensions] = useState<DimensionProps>({
    offset: 0,
    indicatorOffset: 0,
  });
  const isAnchor = Tag === 'a';
  const getScrollableParent = useCallback(
    () => listRef.current?.parentElement,
    [],
  );

  const scrollIfNotInView = useCallback(() => {
    const { activeTabRect, offset } = dimensions;
    if (autoScrollActive && currentActiveTab.current) {
      if (!activeTabRect) {
        return;
      }

      const scrollableParent =
        currentActiveTab.current.parentElement?.parentElement;

      if (!scrollableParent) {
        return;
      }

      const scrollableParentRect = scrollableParent.getBoundingClientRect();
      const isOutOfView =
        activeTabRect.left < scrollableParentRect.left ||
        activeTabRect.right > scrollableParentRect.right;

      if (isOutOfView) {
        const centeredOffset =
          offset - scrollableParentRect.width / 2 + activeTabRect.width / 2;
        scrollableParent.scrollTo({
          left: Math.max(0, centeredOffset),
          behavior: 'smooth',
        });
      }
    }
  }, [autoScrollActive, dimensions]);

  useLayoutEffect(() => {
    // get the active tab's rect and offset so that we can position the indicator
    const activeTabRect = currentActiveTab.current?.getBoundingClientRect();
    const offset = activeTabRect
      ? currentActiveTab.current?.offsetLeft ?? 0
      : 0;
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

  const clearDragSuppression = useCallback(() => {
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }, []);

  const finishDrag = useCallback(() => {
    const dragState = dragStateRef.current;
    if (!dragState) {
      return;
    }

    dragStateRef.current = null;

    if (!dragState.didDrag) {
      return;
    }

    suppressClickRef.current = true;
    clearDragSuppression();
  }, [clearDragSuppression]);

  useEffect(() => {
    if (!dragScroll) {
      return undefined;
    }

    const list = listRef.current;
    if (!list) {
      return undefined;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }

      const scrollableParent = getScrollableParent();
      if (!scrollableParent) {
        return;
      }

      if (scrollableParent.scrollWidth <= scrollableParent.clientWidth) {
        return;
      }

      dragStateRef.current = {
        startClientX: event.clientX,
        startScrollLeft: scrollableParent.scrollLeft,
        didDrag: false,
      };
    };

    const onMouseMove = (event: MouseEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) {
        return;
      }

      const scrollableParent = getScrollableParent();
      if (!scrollableParent) {
        return;
      }

      const offsetX = event.clientX - dragState.startClientX;
      if (!dragState.didDrag && Math.abs(offsetX) < 5) {
        return;
      }

      dragState.didDrag = true;
      scrollableParent.scrollLeft = dragState.startScrollLeft - offsetX;
      event.preventDefault();
    };

    const onMouseUp = () => {
      finishDrag();
    };

    list.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      list.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragScroll, finishDrag, getScrollableParent]);

  const { indicatorOffset } = dimensions;

  return (
    <ul
      ref={listRef}
      className={classNames(
        'relative flex flex-row',
        dragScroll && 'cursor-grab select-none active:cursor-grabbing',
      )}
    >
      {items.map(({ label, url: href, hint }) => {
        const isActive = label === active;
        const renderedTab = renderTab?.({ label, isActive }) ?? (
          <span
            className={classNames(
              'flex flex-row items-center gap-1',
              styles.pill,
              isActive ? styles.activePill : styles.inactivePill,
            )}
          >
            {label?.length > 25 ? `${label.slice(0, 25)}...` : label}
            {hint}
          </span>
        );

        return (
          <Tag
            key={`${label}-${href}`}
            ref={(el: HTMLElement | null) => {
              if (!el || !isActive) {
                return;
              }

              currentActiveTab.current = el;
            }}
            className={classNames(
              className.item,
              'relative p-2 py-4 text-center typo-callout',
              styles.item,
              isActive ? '' : styles.inactiveItem,
              isAnchor && 'cursor-pointer',
            )}
            onClick={(event) => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                event.preventDefault();
                return;
              }

              if (isAnchor) {
                event.preventDefault();
              }
              onClick?.(label, event);
            }}
            onDragStart={
              dragScroll
                ? (event) => {
                    event.preventDefault();
                  }
                : undefined
            }
            {...(isAnchor
              ? {
                  'aria-label': label,
                  draggable: !dragScroll,
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
            'absolute bottom-0 mx-auto h-0.5 -translate-x-1/2 rounded-4 bg-text-primary transition-[left] ease-linear',
            styles.indicator,
            className?.indicator,
          )}
          style={{ left: indicatorOffset }}
        />
      )}
    </ul>
  );
}

export default TabList;
