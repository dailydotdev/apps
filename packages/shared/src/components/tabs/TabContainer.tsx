import React, {
  createElement,
  CSSProperties,
  ReactElement,
  ReactNode,
  useState,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import TabList, { TabListProps } from './TabList';
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
  shouldMountInactive?: boolean;
  onActiveChange?: (active: T) => unknown;
  className?: ClassName;
  style?: CSSProperties;
  showHeader?: boolean;
  controlledActive?: T;
  tabListProps?: Pick<TabListProps, 'className' | 'autoScrollActive'>;
  showBorder?: boolean;
  renderTab?: RenderTab;
}

export function TabContainer<T extends string = string>({
  children,
  shouldMountInactive = false,
  onActiveChange,
  className = {},
  style,
  showHeader = true,
  showBorder = true,
  controlledActive,
  tabListProps = {},
  renderTab,
}: TabContainerProps<T>): ReactElement {
  const router = useRouter();

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
  const onClick = (label: T) => {
    const child = children.find((c) => c.props.label === label);
    setActive(label);
    onActiveChange?.(label);

    if (child?.props?.url) {
      router.push(child.props.url);
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
          items={children.map((child) => child.props.label)}
          renderTab={renderTab}
          onClick={onClick}
          active={currentActive}
          className={tabListProps?.className}
          autoScrollActive={tabListProps?.autoScrollActive}
        />
      </header>
      {render}
    </div>
  );
}

export default TabContainer;
