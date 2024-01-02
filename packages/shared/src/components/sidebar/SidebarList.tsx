import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import SidebarListItem, { SidebarListItemProps } from './SidebarListItem';
import CloseButton from '../CloseButton';

interface SidebarListProps {
  title: string;
  isOpen?: boolean;
  className?: string;
  children?: ReactNode;
  items: SidebarListItemProps[];
  active: string;
  onItemClick?: (item: string) => void;
  onClose?: () => void;
}

function SidebarList({
  className,
  items,
  title,
  isOpen,
  active,
  children,
  onClose,
  onItemClick,
}: SidebarListProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col transition-transform ease-in-out tablet:translate-x-[unset] tablet:items-center tablet:px-6 tablet:pt-6',
        'absolute h-full max-h-[100vh] w-full bg-theme-bg-inherit tablet:relative tablet:h-fit tablet:w-fit',
        isOpen ? 'translate-x-0' : ' -translate-x-full',
        className,
      )}
    >
      <span className="mb-6 flex w-full flex-row items-center justify-between border-b border-theme-divider-tertiary p-2 tablet:hidden">
        <span className="ml-4 font-bold typo-title3">{title}</span>
        <CloseButton onClick={onClose} />
      </span>
      <div className="px-6 tablet:px-0">
        {items.map((props) => (
          <SidebarListItem
            key={props.title}
            {...props}
            isActive={active === props.title}
            onClick={(e) => {
              onItemClick?.(props.title);
              props.onClick?.(e);
            }}
          />
        ))}
        {children}
      </div>
    </div>
  );
}

export default SidebarList;
