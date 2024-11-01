import React, { ReactElement, useMemo } from 'react';
import { ListIcon, SidebarMenuItem } from '../common';
import { DefaultSquadIcon, NewSquadIcon, SourceIcon } from '../../icons';
import { Section } from '../Section';
import { Origin } from '../../../lib/log';
import { useSquadNavigation } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import { SquadImage } from '../../squads/SquadImage';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { webappUrl } from '../../../lib/constants';
import { SidebarSectionProps } from './common';

export const SquadSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { squads } = useAuthContext();
  const { openNewSquad } = useSquadNavigation();
  const discoverMenuItems: SidebarMenuItem[] = useMemo(() => {
    const squadItems = squads.map((squad) => {
      const { permalink, name, image } = squad;
      return {
        icon: () =>
          image ? (
            <SquadImage className="h-5 w-5" {...squad} />
          ) : (
            <DefaultSquadIcon />
          ),
        title: name,
        path: permalink,
      };
    });

    return [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SourceIcon secondary={active} />} />
        ),
        title: 'Squads directory',
        path: `${webappUrl}squads`,
        isForcedLink: true,
      },
      ...squadItems,
      {
        icon: () => <NewSquadIcon />,
        title: 'New Squad',
        action: () => openNewSquad({ origin: Origin.Sidebar }),
        requiresLogin: true,
      },
    ].filter(Boolean);
  }, [openNewSquad, squads]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={discoverMenuItems}
      isItemsButton={isItemsButton}
      flag={SidebarSettingsFlags.SquadExpanded}
    />
  );
};
