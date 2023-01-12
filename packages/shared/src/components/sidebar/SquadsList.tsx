import React, { ReactElement } from 'react';
import { Squad } from '../../graphql/squads';
import DefaultSquadIcon from '../icons/DefaultSquad';
import NewSquadIcon from '../icons/NewSquad';
import { SquadImage } from '../squads/SquadImage';
import { ClickableNavItem } from './ClickableNavItem';
import { ItemInner, NavItem, SidebarMenuItem } from './common';
import TimerIcon from '../icons/Timer';

type SquadsListProps = {
  activePage?: string;
  squads: Squad[];
  onNewSquad: () => void;
};

export function SquadsList({
  activePage,
  squads,
  onNewSquad,
}: SquadsListProps): ReactElement {
  const newSquadMenuItem: SidebarMenuItem = {
    icon: () => <NewSquadIcon />,
    title: 'New Squad',
    action: onNewSquad,
  };

  return (
    <>
      {squads.map((squad) => {
        const { handle, name, permalink, image, active } = squad;
        const menuItem: SidebarMenuItem = {
          icon: () =>
            image ? (
              <SquadImage className="w-5 h-5" {...squad} />
            ) : (
              <DefaultSquadIcon />
            ),
          rightIcon: () => !active && <TimerIcon />,
          title: name,
          path: permalink,
        };
        const isActive = permalink.endsWith(activePage);
        return (
          <NavItem key={`squad-${handle}`} active={isActive}>
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
