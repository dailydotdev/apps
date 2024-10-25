import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import { ClickableNavItem } from './ClickableNavItem';
import {
  ItemInner,
  ItemInnerProps,
  NavHeader,
  NavItem,
  NavSection,
  SidebarMenuItem,
} from './common';
import { AuthTriggersType } from '../../lib/auth';
import { TextPlaceholder } from '../widgets/common';

export interface SectionCommonProps
  extends Pick<ItemInnerProps, 'shouldShowLabel'> {
  sidebarExpanded: boolean;
  sidebarRendered: boolean;
  activePage: string;
  className?: string;
}

interface SectionProps extends SectionCommonProps {
  title?: string;
  items: SidebarMenuItem[];
  isItemsButton: boolean;
  isLoading?: boolean;
}

const ItemsSkeleton = () => {
  return (
    <>
      <div className="flex items-center">
        <TextPlaceholder className="m-3 h-5 w-5 rounded-full" />
        <TextPlaceholder className="w-[40%]" />
      </div>
      <div className="flex items-center">
        <TextPlaceholder className="m-3 h-5 w-5 rounded-full" />
        <TextPlaceholder className="w-[40%]" />
      </div>
      <div className="flex items-center">
        <TextPlaceholder className="m-3 h-5 w-5 rounded-full" />
        <TextPlaceholder className="w-[40%]" />
      </div>
      <div className="flex items-center">
        <TextPlaceholder className="m-3 h-5 w-5 rounded-full" />
        <TextPlaceholder className="w-[40%]" />
      </div>
    </>
  );
};

export function Section({
  title,
  items,
  sidebarExpanded,
  sidebarRendered,
  shouldShowLabel,
  activePage,
  isItemsButton,
  className,
  isLoading,
}: SectionProps): ReactElement {
  const { user, showLogin } = useContext(AuthContext);

  const mobileItemsFilter = (item: SidebarMenuItem) =>
    (sidebarRendered === false && !item.hideOnMobile) || sidebarRendered;

  const isActive = (item: SidebarMenuItem) => {
    return item.active || item.path === activePage;
  };

  return (
    <NavSection className={className}>
      {title && (
        <NavHeader
          className={classNames(
            'hidden laptop:flex',
            sidebarExpanded ? 'px-3 opacity-100' : 'px-0 opacity-0',
          )}
        >
          {title}
        </NavHeader>
      )}
      {isLoading && <ItemsSkeleton />}
      {items.filter(mobileItemsFilter).map((item) => (
        <NavItem
          key={`${item.title}-${item.path}`}
          active={isActive(item)}
          ref={item.navItemRef}
        >
          <ClickableNavItem
            item={item}
            showLogin={
              item.requiresLogin && !user
                ? () => showLogin({ trigger: item.title as AuthTriggersType })
                : null
            }
            isButton={isItemsButton && !item?.isForcedLink}
            className="truncate"
          >
            <ItemInner
              item={item}
              shouldShowLabel={shouldShowLabel}
              active={isActive(item)}
            />
          </ClickableNavItem>
        </NavItem>
      ))}
    </NavSection>
  );
}
