import React from 'react';
import type { SidebarMenuItem } from '../common';
import { DefaultSquadIcon } from '../../icons';
import { SquadImage } from '../../squads/SquadImage';
import { SquadFavoriteButton } from '../../squads/SquadFavoriteButton';
import { webappUrl } from '../../../lib/constants';
import type { Squad } from '../../../graphql/sources';

// Shared squad row for the sidebar (the full Squads list and the Home
// "Pinned" section render identical rows). `asPin` switches the favorite
// button to the v2 pin icon/label.
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
    rightIcon: () => <SquadFavoriteButton squad={squad} asPin={asPin} />,
  };
};
