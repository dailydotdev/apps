import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SidebarListItemProps } from './SidebarListItem';
import SidebarListItem from './SidebarListItem';
import { Button, ButtonSize } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { useModalContext } from '../modals/common/types';

interface SidebarListProps {
  title: ReactNode;
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
        'tablet:translate-x-[unset] tablet:items-center flex flex-col p-2 transition-transform ease-in-out',
        'bg-background-default tablet:relative tablet:w-fit absolute h-full max-h-[100vh] w-full overflow-hidden',
        isOpen ? 'translate-x-0' : 'top-0 -translate-x-full',
        className,
      )}
    >
      <span className="border-border-subtlest-tertiary tablet:hidden mb-6 flex w-full flex-row items-center border-b p-2 px-4">
        <Button
          size={ButtonSize.Small}
          className="tablet:hidden flex -rotate-90"
          icon={<ArrowIcon />}
          onClick={onRequestClose}
        />
        <span className="typo-title3 ml-2 font-bold">{title}</span>
      </span>
      <div className="tablet:px-0 px-4">
        {Object.keys(sidebarGroups).map((group) => {
          const groupItems = sidebarGroups[group];

          return (
            <div key={group} className="flex flex-col">
              {group !== defaultGroup && (
                <span className="text-text-quaternary typo-callout my-3 px-4 font-bold">
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
