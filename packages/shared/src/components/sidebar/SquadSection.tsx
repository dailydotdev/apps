import React, { ReactElement, useContext } from 'react';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { NewSquadIcon, DefaultSquadIcon, SourceIcon } from '../icons';
import { Origin } from '../../lib/analytics';
import { useSquadNavigation } from '../../hooks';
import AuthContext from '../../contexts/AuthContext';
import { SquadImage } from '../squads/SquadImage';

export function SquadSection(props: SectionCommonProps): ReactElement {
  const { squads } = useContext(AuthContext);
  const { openNewSquad } = useSquadNavigation();

  const squadMenuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <SourceIcon secondary={active} />} />
      ),
      title: 'Public Squads',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}squads`,
      isForcedLink: true,
      rightIcon: () => (
        <span className="font-bold text-text-quaternary typo-caption1">
          beta
        </span>
      ),
    },
    {
      icon: () => <NewSquadIcon />,
      title: 'New Squad',
      action: () => openNewSquad({ origin: Origin.Sidebar }),
    },
  ];

  squads?.forEach((squad) => {
    const { permalink, name, image } = squad;
    squadMenuItems.push({
      icon: () =>
        image ? (
          <SquadImage className="h-5 w-5" {...squad} />
        ) : (
          <DefaultSquadIcon />
        ),
      title: name,
      path: permalink,
    });
  });

  return (
    <Section
      title="Squads"
      items={squadMenuItems}
      {...props}
      isItemsButton={false}
    />
  );
}
