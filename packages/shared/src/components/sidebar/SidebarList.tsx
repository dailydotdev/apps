import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import SidebarListItem, { SidebarListItemProps } from './SidebarListItem';
import CloseButton from '../CloseButton';
import { Button, ButtonSize } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { useModalContext } from '../modals/common/types';

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
  const { onRequestClose } = useModalContext();

  return (
    <div
      className={classNames(
        'flex flex-col transition-transform ease-in-out tablet:translate-x-[unset] tablet:items-center tablet:px-6 tablet:pt-6',
        'absolute h-full max-h-[100vh] w-full bg-inherit tablet:relative tablet:h-fit tablet:w-fit',
        isOpen ? 'translate-x-0' : ' -translate-x-full',
        className,
      )}
    >
      <span className="mb-6 flex w-full flex-row items-center border-b border-theme-divider-tertiary p-2 tablet:hidden">
        <Button
          size={ButtonSize.Small}
          className="flex -rotate-90 tablet:hidden"
          icon={<ArrowIcon />}
          onClick={onRequestClose}
        />
        <span className="ml-2 font-bold typo-title3">{title}</span>
        <CloseButton className="hidden tablet:flex" onClick={onClose} />
      </span>
      <div className="px-4 tablet:px-0">
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
