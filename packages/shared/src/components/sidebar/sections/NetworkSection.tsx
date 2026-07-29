import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { SourceIcon, TimerIcon } from '../../icons';
import { Section } from '../Section';
import { Origin } from '../../../lib/log';
import { useSquadNavigation } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { squadCategoriesPaths, webappUrl } from '../../../lib/constants';
import type { SidebarSectionProps } from './common';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { Typography, TypographyColor } from '../../typography/Typography';
import { SourcePostModerationStatus } from '../../../graphql/squads';
import { createSquadMenuItem } from './squadMenuItem';

export const NetworkSection = ({
  isItemsButton,
  // v2 reframes squad "favorite" as "pin"; passed only by the v2 sidebar so
  // this shared section keeps the v1 star when the flag is absent.
  asPin = false,
  ...defaultRenderSectionProps
}: SidebarSectionProps & { asPin?: boolean }): ReactElement => {
  const { squads } = useAuthContext();
  const { openNewSquad } = useSquadNavigation();
  const { count, isModeratorInAnySquad } = useSquadPendingPosts({
    status: [SourcePostModerationStatus.Pending],
  });

  const handleAddSquad = useCallback(() => {
    openNewSquad({ origin: Origin.Sidebar });
  }, [openNewSquad]);

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const squadItems =
      squads?.map((squad) => createSquadMenuItem(squad, asPin)) ?? [];
    return [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SourceIcon secondary={active} />} />
        ),
        title: 'Find Squads',
        // Absolute webapp URL so the extension's new tab links out to
        // daily.dev instead of resolving against the chrome-extension://
        // origin. Active-state matching strips the origin, so the webapp
        // highlight still works.
        path: `${webappUrl}${squadCategoriesPaths.discover.substring(1)}`,
        isForcedLink: true,
      },
      isModeratorInAnySquad && {
        icon: () => <ListIcon Icon={() => <TimerIcon />} />,
        title: 'Pending Posts',
        path: `${webappUrl}squads/moderate`,
        ...(count > 0 && {
          rightIcon: () => (
            <Typography
              color={TypographyColor.Secondary}
              bold
              className="rounded-6 bg-background-subtle px-1.5"
            >
              {count >= 15 ? '15+' : count}
            </Typography>
          ),
        }),
      },
      ...squadItems,
    ].filter(Boolean) as SidebarMenuItem[];
  }, [squads, isModeratorInAnySquad, count, asPin]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={false}
      flag={SidebarSettingsFlags.SquadExpanded}
      onAdd={handleAddSquad}
    />
  );
};
