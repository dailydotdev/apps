import React, { ReactElement } from 'react';
import { Squad } from '../../graphql/squads';
import DefaultSquadIcon from '../icons/DefaultSquad';
import NewSquadIcon from '../icons/NewSquad';
import { ClickableNavItem } from './ClickableNavItem';
import { ItemInner, NavItem, SidebarMenuItem } from './common';

type SquadsListProps = {
  squads: Squad[];
  onNavTabClick?: (page: string) => unknown;
};

export function SquadsList({
  squads,
  onNavTabClick,
}: SquadsListProps): ReactElement {
  const newSquadMenuItem: SidebarMenuItem = {
    icon: () => <NewSquadIcon />,
    title: 'New squad',
    path: '/new-squad',
  };

  return (
    <>
      {squads.map(({ handle, name, permalink }) => {
        const menuItem: SidebarMenuItem = {
          icon: () => <DefaultSquadIcon />,
          title: name,
          path: permalink,
          action: () => onNavTabClick?.(`dsadsquads/${handle}`),
        };
        return (
          <NavItem key={`squad-${handle}`}>
            <ClickableNavItem item={menuItem}>
              <ItemInner item={menuItem} sidebarExpanded />
            </ClickableNavItem>
          </NavItem>
        );
      })}
      <NavItem>
        <ClickableNavItem item={newSquadMenuItem}>
          <ItemInner item={newSquadMenuItem} sidebarExpanded />
        </ClickableNavItem>
      </NavItem>
    </>
  );
}
