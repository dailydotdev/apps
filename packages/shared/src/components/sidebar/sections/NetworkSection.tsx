import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import {
  DefaultSquadIcon,
  NewSquadIcon,
  SourceIcon,
  TimerIcon,
} from '../../icons';
import { Section } from '../Section';
import { Origin } from '../../../lib/log';
import { useConditionalFeature, useSquadNavigation } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import { SquadImage } from '../../squads/SquadImage';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { webappUrl } from '../../../lib/constants';
import type { SidebarSectionProps } from './common';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { Typography, TypographyColor } from '../../typography/Typography';
import { SourcePostModerationStatus } from '../../../graphql/squads';
import { showSquadUnreadPosts } from '../../../lib/featureManagement';
import { useSettingsContext } from '../../../contexts/SettingsContext';

export const NetworkSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { squads } = useAuthContext();
  const { sidebarExpanded } = useSettingsContext();
  const { openNewSquad } = useSquadNavigation();
  const { count, isModeratorInAnySquad } = useSquadPendingPosts({
    status: [SourcePostModerationStatus.Pending],
  });

  const { value: showUnreadPosts } = useConditionalFeature({
    feature: showSquadUnreadPosts,
    shouldEvaluate: sidebarExpanded,
  });

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const squadItems =
      squads?.map((squad) => {
        const { name, image, handle, hasUnreadPosts } = squad;
        return {
          icon: () =>
            image ? (
              <SquadImage className="h-5 w-5" {...squad} />
            ) : (
              <DefaultSquadIcon />
            ),
          title: name,
          path: `${webappUrl}squads/${handle}`,
          className: {
            text:
              showUnreadPosts && hasUnreadPosts
                ? 'font-bold text-text-primary'
                : '',
          },
        };
      }) ?? [];
    return [
      isModeratorInAnySquad &&
        count > 0 && {
          icon: () => <ListIcon Icon={() => <TimerIcon />} />,
          title: 'Pending Posts',
          path: `${webappUrl}squads/moderate`,
          rightIcon: () => (
            <Typography
              color={TypographyColor.Secondary}
              bold
              className="rounded-6 bg-background-subtle px-1.5"
            >
              {count >= 15 ? '15+' : count}
            </Typography>
          ),
        },
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
  }, [squads, isModeratorInAnySquad, count, showUnreadPosts, openNewSquad]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={false}
      flag={SidebarSettingsFlags.SquadExpanded}
    />
  );
};
