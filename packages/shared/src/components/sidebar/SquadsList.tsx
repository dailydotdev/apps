import React, { ReactElement } from 'react';
import { Squad } from '../../graphql/squads';
import DefaultSquadIcon from '../icons/DefaultSquad';
import NewSquadIcon from '../icons/NewSquad';
import { SquadImage } from '../squads/SquadImage';
import { ClickableNavItem } from './ClickableNavItem';
import { ItemInner, NavItem, SidebarMenuItem } from './common';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import TimerIcon from '../icons/Timer';

type SquadsListProps = {
  squads: Squad[];
  onNewSquad: () => void;
};

export function SquadsList({
  squads,
  onNewSquad,
}: SquadsListProps): ReactElement {
  const newSquadMenuItem: SidebarMenuItem = {
    icon: () => <NewSquadIcon />,
    title: 'New squad',
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
