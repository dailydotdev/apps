import React, { ReactElement } from 'react';
import { Squad } from '../../graphql/squads';
import DefaultSquadIcon from '../icons/DefaultSquad';
import NewSquadIcon from '../icons/NewSquad';
import { ClickableNavItem } from './ClickableNavItem';
import { ItemInner, NavItem, SidebarMenuItem } from './common';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';

type SquadsListProps = {
  squads: Squad[];
  onNavTabClick?: (page: string) => unknown;
};

const SquadImage = ({ image, name }: Squad) => (
  <Image
    title={name}
    src={image}
    fallbackSrc={cloudinary.squads.imageFallback}
    className="object-cover w-5 h-5 rounded-full"
    loading="lazy"
  />
);

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
      {squads.map((squad) => {
        const { handle, name, permalink, image } = squad;
        const menuItem: SidebarMenuItem = {
          icon: () =>
            image ? <SquadImage {...squad} /> : <DefaultSquadIcon />,
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
