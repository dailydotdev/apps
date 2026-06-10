import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { DefaultSquadIcon } from '../../icons';
import { Section } from '../Section';
import { useAuthContext } from '../../../contexts/AuthContext';
import { SquadImage } from '../../squads/SquadImage';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { webappUrl } from '../../../lib/constants';
import type { SidebarSectionProps } from './common';
import { SquadFavoriteButton } from '../../squads/SquadFavoriteButton';

// v2 Home panel: the squads the user has pinned (reuses the favorite state).
// Renders nothing when there's nothing pinned so the Home panel stays clean.
export const PinnedSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement | null => {
  const { squads } = useAuthContext();

  const pinnedSquads = useMemo(
    () => squads?.filter((squad) => !!squad.favoritedAt) ?? [],
    [squads],
  );

  const menuItems: SidebarMenuItem[] = useMemo(
    () =>
      pinnedSquads.map((squad) => {
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
          rightIcon: () => <SquadFavoriteButton squad={squad} asPin />,
        };
      }),
    [pinnedSquads],
  );

  if (!pinnedSquads.length) {
    return null;
  }

  return (
    <Section
      {...defaultRenderSectionProps}
      title="Pinned"
      items={menuItems}
      isItemsButton={false}
      flag={SidebarSettingsFlags.PinnedExpanded}
    />
  );
};
