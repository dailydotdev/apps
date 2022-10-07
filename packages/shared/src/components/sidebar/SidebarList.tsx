import React, { ReactElement, ReactNode, useState } from 'react';
import classNames from 'classnames';
import SidebarListItem, { SidebarListItemProps } from './SidebarListItem';
import CloseButton from '../modals/CloseButton';

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
  const [display, setDisplay] = useState(items?.[0]?.title);
  return (
    <div
      className={classNames(
        'flex flex-col tablet:items-center tablet:px-6 tablet:pt-6 ease-in-out transition-transform tablet:translate-x-[unset]',
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
            isActive={(active || display) === props.title}
            onClick={(e) => {
              setDisplay(props.title);
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
