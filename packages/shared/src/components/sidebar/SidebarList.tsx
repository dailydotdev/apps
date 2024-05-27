import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import SidebarListItem, { SidebarListItemProps } from './SidebarListItem';
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
}

const defaultGroup = 'Default';

function SidebarList({
  className,
  items,
  title,
  isOpen,
  active,
  children,
  onItemClick,
}: SidebarListProps): ReactElement {
  const { onRequestClose } = useModalContext();

  const sidebarGroups = items.reduce((acc, item) => {
    const group = item.group ?? defaultGroup;

    if (!acc[group]) {
      acc[group] = [];
    }

    acc[group].push(item);

    return acc;
  }, {} as Record<string, SidebarListItemProps[]>);

  return (
    <div
      className={classNames(
        'flex flex-col transition-transform ease-in-out tablet:translate-x-[unset] tablet:items-center tablet:px-6 tablet:pt-6',
        'absolute h-fit max-h-[100vh] w-full bg-inherit tablet:relative tablet:w-fit',
        isOpen ? 'translate-x-0' : ' -translate-x-full',
        className,
      )}
    >
      <span className="mb-6 flex w-full flex-row items-center border-b border-border-subtlest-tertiary p-2 px-4 tablet:hidden">
        <Button
          size={ButtonSize.Small}
          className="flex -rotate-90 tablet:hidden"
          icon={<ArrowIcon />}
          onClick={onRequestClose}
        />
        <span className="ml-2 font-bold typo-title3">{title}</span>
      </span>
      <div className="px-4 tablet:px-0">
        {Object.keys(sidebarGroups).map((group) => {
          const groupItems = sidebarGroups[group];

          return (
            <div key={group} className="flex flex-col">
              {group !== defaultGroup && (
                <span className="my-3 px-4 font-bold text-text-quaternary typo-callout">
                  {group}
                </span>
              )}
              {groupItems.map((props) => (
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
            </div>
          );
        })}
        {children}
      </div>
    </div>
  );
}

export default SidebarList;
