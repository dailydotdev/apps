import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, {
  createElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useSwipeable } from 'react-swipeable';
import type { AllowedTabTags, TabListProps } from './TabList';
import TabList from './TabList';
import type { RenderTab } from './common';

export interface TabProps<T extends string> {
  children?: ReactNode;
  label: T;
  hint?: ReactNode;
  className?: string;
  style?: CSSProperties;
  showHeader?: boolean;
  url?: string;
}

export const Tab = <T extends string>({
  children,
  className,
  style,
}: TabProps<T>): ReactElement =>
  !className && !style ? (
    <>{children}</>
  ) : (
    <div className={className} style={style}>
      {children}
    </div>
  );

interface ClassName {
  container?: string;
  header?: string;
}

export interface TabContainerProps<T extends string = string> {
  children?: ReactElement<TabProps<T>>[];
  className?: ClassName;
  controlledActive?: T;
  onActiveChange?: (
    active: T,
    event?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => boolean | void;
  renderTab?: RenderTab;
  shouldFocusTabOnChange?: boolean;
  shouldMountInactive?: boolean;
  showBorder?: boolean;
  showHeader?: boolean;
  style?: CSSProperties;
  shallow?: boolean;
  swipeable?: boolean;
  tabListProps?: Pick<TabListProps, 'className' | 'autoScrollActive'>;
  tabTag?: AllowedTabTags;
  extraHeaderContent?: ReactNode;
}

export function TabContainer<T extends string = string>({
  children,
  className = {},
  controlledActive,
  onActiveChange,
  renderTab,
  shouldFocusTabOnChange = false,
  shouldMountInactive = false,
  showBorder = true,
  showHeader = true,
  style,
  shallow = false,
  swipeable = false,
  tabListProps = {},
  tabTag,
  extraHeaderContent,
}: TabContainerProps<T>): ReactElement {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(() => {
    const defaultLabel = children[0].props.label;

    if (children[0].props.url) {
      const matchingChild = children.find(
        (c) => c.props.url === router.pathname,
      );
      return matchingChild ? matchingChild.props.label : defaultLabel;
    }

    return defaultLabel;
  });

  const currentActive = controlledActive ?? active;
  const onClick: TabListProps['onClick'] = (label: T, event) => {
    const child = children.find((c) => c.props.label === label);
    setActive(label);
    const shouldChange = onActiveChange?.(label, event);

    // evaluate !== false due to backwards compatibility with implementations that return undefined
    if (shouldChange !== false) {
      setTimeout(() => {
        if (shouldFocusTabOnChange && containerRef?.current) {
          const [firstChild] = containerRef.current.children;
          if (firstChild instanceof HTMLElement) {
            firstChild.focus();
          }
        }
      }, 0);

      if (child?.props?.url) {
        if (shallow) {
          router.replace(child.props.url, undefined, { shallow: true });
        } else {
          router.push(child.props.url);
        }
      }
    }
  };

  const labels = useMemo(() => children.map((c) => c.props.label), [children]);

  const navigateTab = useCallback(
    (direction: 'next' | 'previous') => {
      const currentIndex = labels.indexOf(currentActive);
      const nextIndex =
        direction === 'next' ? currentIndex + 1 : currentIndex - 1;

      if (nextIndex < 0 || nextIndex >= labels.length) {
        return;
      }

      const nextChild = children[nextIndex];
      const nextLabel = nextChild.props.label;
      setActive(nextLabel);
      onActiveChange?.(nextLabel, undefined);

      if (nextChild.props.url) {
        if (shallow) {
          router.replace(nextChild.props.url, undefined, { shallow: true });
        } else {
          router.push(nextChild.props.url);
        }
      }
    },
    [children, currentActive, labels, onActiveChange, router, shallow],
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateTab('next'),
    onSwipedRight: () => navigateTab('previous'),
    trackTouch: true,
    delta: 10,
  });

  const isTabActive = ({
    props: { url, label },
  }: ReactElement<TabProps<T>>) => {
    if (controlledActive) {
      return label === currentActive;
    }

    if (url) {
      return router.asPath === url;
    }

    return label === currentActive;
  };

  const renderSingleComponent = () => {
    if (!shouldMountInactive) {
      const child = children.find(isTabActive);

      return createElement(child.type, child.props);
    }

    return null;
  };

  const render = !shouldMountInactive
    ? renderSingleComponent()
    : children.map((child, i) =>
        createElement<TabProps<T>>(child.type, {
          ...child.props,
          key: child.key || child.props.label || i,
          style: isTabActive(child)
            ? child.props.style
            : { ...child.props.style, display: 'none' },
        }),
      );

  if (!showHeader) {
    return <>{render}</>;
  }

  return (
    <div
      className={classNames('flex flex-col', className?.container)}
      ref={containerRef}
      style={style}
    >
      <header
        className={classNames(
          'flex flex-row',
          className?.header,
          showBorder &&
            'border-b border-border-subtlest-tertiary bg-background-default tablet:bg-[unset]',
        )}
      >
        <TabList<T>
          items={children.map(({ props }) => ({
            label: props.label,
            url: props.url,
            hint: props.hint,
          }))}
          renderTab={renderTab}
          onClick={onClick}
          active={currentActive}
          className={tabListProps?.className}
          autoScrollActive={tabListProps?.autoScrollActive}
          tag={tabTag}
        />
        {extraHeaderContent}
      </header>
      <div {...(swipeable ? swipeHandlers : {})}>{render}</div>
    </div>
  );
}

export default TabContainer;
