import React, { ReactElement, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { NewSquadIcon, DefaultSquadIcon, SourceIcon } from '../icons';
import { Origin } from '../../lib/log';
import { useSquadNavigation } from '../../hooks';
import AuthContext from '../../contexts/AuthContext';
import { SquadImage } from '../squads/SquadImage';
import { getSquads } from '../../graphql/squads';
import { TextPlaceholder } from '../widgets/common';

export function SquadSection(props: SectionCommonProps): ReactElement {
  const { user } = useContext(AuthContext);

  const { data: squads, isLoading } = useQuery(['squads'], () =>
    getSquads(user?.id),
  );
  const { openNewSquad } = useSquadNavigation();

  const squadMenuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <SourceIcon secondary={active} />} />
      ),
      title: 'Public Squads',
      path: `${process.env.NEXT_PUBLIC_WEBAPP_URL}squads`,
      isForcedLink: true,
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

  squadMenuItems.push({
    icon: () => <NewSquadIcon />,
    title: 'New Squad',
    action: () => openNewSquad({ origin: Origin.Sidebar }),
    requiresLogin: true,
  });

  return (
    <Section
      title="Squads"
      items={squadMenuItems}
      {...props}
      isItemsButton={false}
      isLoading={isLoading}
    />
  );
}
