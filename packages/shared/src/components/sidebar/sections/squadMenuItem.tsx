import React from 'react';
import type { SidebarMenuItem } from '../common';
import { DefaultSquadIcon } from '../../icons';
import { SquadImage } from '../../squads/SquadImage';
import { SquadShortcutPinButton } from '../SquadShortcutPinButton';
import { webappUrl } from '../../../lib/constants';
import type { Squad } from '../../../graphql/sources';
import { hasSquadFeature } from '../../../features/squads/lib/features';
import { VerifiedSquadBadge } from '../../../features/squads/components/VerifiedSquad';

// Squad row for the rail panel; the pin adds the squad to the sidebar
// shortcuts dock.
export const createSquadMenuItem = (squad: Squad): SidebarMenuItem => {
  const { name, image, handle } = squad;
  return {
    icon: () =>
      image ? (
        <SquadImage className="h-5 w-5" {...squad} />
      ) : (
        <DefaultSquadIcon />
      ),
    title: name,
    titleSuffix: hasSquadFeature(squad, 'verified') ? (
      <VerifiedSquadBadge />
    ) : undefined,
    path: `${webappUrl}squads/${handle}`,
    itemClassName: 'group/squad-row',
    rightIcon: () => <SquadShortcutPinButton squad={squad} />,
  };
};
