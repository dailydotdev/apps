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
        'flex flex-col tablet:items-center tablet:px-6 tablet:pt-6 ease-in-out transition-transform tablet:translate-x-[unset]',
        'absolute tablet:relative w-full h-full max-h-[100vh] tablet:w-fit tablet:h-fit bg-theme-bg-inherit',
        isOpen ? 'translate-x-0' : ' -translate-x-full',
        className,
      )}
    >
      <span className="flex tablet:hidden flex-row justify-between items-center p-2 mb-6 w-full border-b border-theme-divider-tertiary">
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
