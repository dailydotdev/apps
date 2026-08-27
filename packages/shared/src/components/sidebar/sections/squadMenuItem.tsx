import React from 'react';
import type { SidebarMenuItem } from '../common';
import { DefaultSquadIcon } from '../../icons';
import { SquadImage } from '../../squads/SquadImage';
import { SquadFavoriteButton } from '../../squads/SquadFavoriteButton';
import { SquadShortcutPinButton } from '../SquadShortcutPinButton';
import { webappUrl } from '../../../lib/constants';
import type { Squad } from '../../../graphql/sources';

// Shared squad row for the sidebar. `asPin` (v2) swaps the backend "favorite"
// star for a pin that adds the squad to the sidebar shortcuts dock; v1 keeps
// the favorite star.
export const createSquadMenuItem = (
  squad: Squad,
  asPin: boolean,
): SidebarMenuItem => {
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
    itemClassName: 'group/squad-row',
    rightIcon: () =>
      asPin ? (
        <SquadShortcutPinButton squad={squad} />
      ) : (
        <SquadFavoriteButton squad={squad} />
      ),
  };
};
