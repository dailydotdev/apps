import React, {
  createElement,
  CSSProperties,
  ReactElement,
  ReactNode,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import TabList, { AllowedTabTags, TabListProps } from './TabList';
import { RenderTab } from './common';

export interface TabProps<T extends string> {
  children?: ReactNode;
  label: T;
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
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => boolean | void;
  renderTab?: RenderTab;
  shouldFocusTabOnChange?: boolean;
  shouldMountInactive?: boolean;
  showBorder?: boolean;
  showHeader?: boolean;
  style?: CSSProperties;
  tabListProps?: Pick<TabListProps, 'className' | 'autoScrollActive'>;
  tabTag?: AllowedTabTags;
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
  tabListProps = {},
  tabTag,
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
        router.push(child.props.url);
      }
    }
  };

  const isTabActive = ({
    props: { url, label },
  }: ReactElement<TabProps<T>>) => {
    if (url) {
      return router.pathname === url;
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
          key: child.props.label || i,
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
          items={children.map((child) => ({
            label: child.props.label,
            url: child.props?.url,
          }))}
          renderTab={renderTab}
          onClick={onClick}
          active={currentActive}
          className={tabListProps?.className}
          autoScrollActive={tabListProps?.autoScrollActive}
          tag={tabTag}
        />
      </header>
      {render}
    </div>
  );
}

export default TabContainer;
