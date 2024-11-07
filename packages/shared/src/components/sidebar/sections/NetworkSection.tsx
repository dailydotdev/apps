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

export const NetworkSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { squads } = useAuthContext();
  const { openNewSquad } = useSquadNavigation();
  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const squadItems =
      squads?.map((squad) => {
        const { name, image, handle } = squad;
        return {
          icon: () =>
            image ? (
              <SquadImage className="h-5 w-5" {...squad} />
            ) : (
              <DefaultSquadIcon />
            ),
          title: name,
          path: `${webappUrl}squads/${handle}`,
        };
      }) ?? [];

    return [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SourceIcon secondary={active} />} />
        ),
        title: 'Find Squads',
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
      items={menuItems}
      isItemsButton={false}
      flag={SidebarSettingsFlags.SquadExpanded}
    />
  );
};
