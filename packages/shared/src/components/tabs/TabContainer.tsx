import React, {
  createElement,
  CSSProperties,
  ReactElement,
  ReactNode,
  useState,
} from 'react';
import classNames from 'classnames';
import TabList from './TabList';

export interface TabProps {
  key?: number;
  children: ReactNode;
  label: string;
  className?: string;
  style?: CSSProperties;
}

export const Tab = ({ children, className, style }: TabProps): ReactElement => (
  <div className={classNames('p-3', className)} style={style}>
    {children}
  </div>
);

export interface TabContainerProps {
  children?: ReactElement<TabProps>[];
  shouldMountInactive?: boolean;
  onActiveChange?: (active: string) => unknown;
  className?: string;
  style?: CSSProperties;
}

function TabContainer({
  children,
  shouldMountInactive = false,
  onActiveChange,
  className,
  style,
}: TabContainerProps): ReactElement {
  const [active, setActive] = useState(children[0].props.label);
  const onClick = (label: string) => {
    setActive(label);
    onActiveChange(label);
  };

  const isTabActive = (child: ReactElement<TabProps>) =>
    child.props.label === active;

  const renderSingleComponent = () => {
    if (!shouldMountInactive) {
      const child = children.find(isTabActive);

      return createElement(child.type, child.props);
    }

    return null;
  };

  return (
    <div className={classNames('flex flex-col', className)} style={style}>
      <header className="flex flex-row border-b border-theme-divider-tertiary">
        <TabList
          items={children.map((child) => child.props.label)}
          onClick={onClick}
          active={active}
        />
      </header>
      {!shouldMountInactive
        ? renderSingleComponent()
        : children.map((child, i) =>
            createElement(child.type, {
              ...child.props,
              key: child.props.key || i,
              style: isTabActive(child)
                ? child.props.style
                : { ...child.props.style, display: 'none' },
            }),
          )}
    </div>
  );
}

export default TabContainer;
