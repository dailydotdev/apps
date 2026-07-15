import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { Section } from '../Section';
import { useAuthContext } from '../../../contexts/AuthContext';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import type { SidebarSectionProps } from './common';
import { createSquadMenuItem } from './squadMenuItem';

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
    () => pinnedSquads.map((squad) => createSquadMenuItem(squad, true)),
    [pinnedSquads],
  );

  // Always show the "Pinned" header (even when empty) so users discover the
  // feature and understand what the rows below represent.
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
