import React, {
  createElement,
  CSSProperties,
  ReactElement,
  ReactNode,
  useState,
} from 'react';
import classNames from 'classnames';
import TabList, { TabListProps } from './TabList';

export interface TabProps<T extends string> {
  key?: number;
  children: ReactNode;
  label: T;
  className?: string;
  style?: CSSProperties;
  showHeader?: boolean;
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

export interface TabContainerProps<T extends string> {
  children?: ReactElement<TabProps<T>>[];
  shouldMountInactive?: boolean;
  onActiveChange?: (active: T) => unknown;
  className?: ClassName;
  style?: CSSProperties;
  showHeader?: boolean;
  controlledActive?: string;
  tabListProps?: Pick<TabListProps, 'className'>;
}

export function TabContainer<T extends string = string>({
  children,
  shouldMountInactive = false,
  onActiveChange,
  className = {},
  style,
  showHeader = true,
  controlledActive,
  tabListProps = {},
}: TabContainerProps<T>): ReactElement {
  const [active, setActive] = useState(children[0].props.label);
  const currentActive = controlledActive ?? active;
  const onClick = (label: T) => {
    setActive(label);
    onActiveChange?.(label);
  };

  const isTabActive = (child: ReactElement<TabProps<T>>) =>
    child.props.label === currentActive;

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
          key: child.props.key || i,
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
          'flex flex-row border-b border-theme-divider-tertiary',
          className?.header,
        )}
      >
        <TabList
          items={children.map((child) => child.props.label)}
          onClick={onClick}
          active={currentActive}
          className={tabListProps?.className}
        />
      </header>
      {render}
    </div>
  );
}

export default TabContainer;
