import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { DefaultSquadIcon, SourceIcon, TimerIcon } from '../../icons';
import { Section } from '../Section';
import { Origin } from '../../../lib/log';
import { useSquadNavigation } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import { SquadImage } from '../../squads/SquadImage';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { squadCategoriesPaths, webappUrl } from '../../../lib/constants';
import type { SidebarSectionProps } from './common';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { Typography, TypographyColor } from '../../typography/Typography';
import { SourcePostModerationStatus } from '../../../graphql/squads';
import { SquadFavoriteButton } from '../../squads/SquadFavoriteButton';
import { useLayoutVariant } from '../../../hooks/layout/useLayoutVariant';

export const NetworkSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { squads } = useAuthContext();
  const { isV2 } = useLayoutVariant();
  const { openNewSquad } = useSquadNavigation();
  const { count, isModeratorInAnySquad } = useSquadPendingPosts({
    status: [SourcePostModerationStatus.Pending],
  });

  const handleAddSquad = useCallback(() => {
    openNewSquad({ origin: Origin.Sidebar });
  }, [openNewSquad]);

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    // v2 pins live in the Home → Pinned section, so the Squads list no longer
    // floats favorited squads to the top — show them in plain alphabetical
    // order instead of the boot-applied favorite-first sort.
    const orderedSquads =
      isV2 && squads
        ? [...squads].sort((a, b) =>
            a.name
              .toLocaleLowerCase()
              .localeCompare(b.name.toLocaleLowerCase()),
          )
        : squads;
    const squadItems =
      orderedSquads?.map((squad) => {
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
          rightIcon: () => <SquadFavoriteButton squad={squad} asPin={isV2} />,
        };
      }) ?? [];
    return [
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SourceIcon secondary={active} />} />
        ),
        title: 'Find Squads',
        // Point at the actual landing page (`/squads` redirects here)
        // so the active-state highlight matches the URL the user
        // actually navigates to.
        path: squadCategoriesPaths.discover,
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
  }, [squads, isV2, isModeratorInAnySquad, count]);

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
