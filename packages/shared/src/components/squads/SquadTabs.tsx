import type { ReactElement } from 'react';
import React from 'react';
import { TabContainer, Tab } from '../tabs/TabContainer';
import { webappUrl } from '../../lib/constants';
import { SourcePermissions } from '../../graphql/sources';
import { verifyPermission } from '../../graphql/squads';
import { useSquad } from '../../hooks';

export enum SquadTab {
  Settings = 'Settings',
  PendingPosts = 'Pending posts',
}

interface SquadTabsProps {
  active: SquadTab;
  handle: string;
}

export function SquadTabs({ active, handle }: SquadTabsProps): ReactElement {
  const { squad } = useSquad({
    handle,
  });
  const isModerator = verifyPermission(squad, SourcePermissions.ModeratePost);
  const squadLink = `${webappUrl}squads/${handle}`;
  const pendingTabLabel = squad?.moderationPostCount
    ? `${SquadTab.PendingPosts} (${squad?.moderationPostCount})`
    : SquadTab.PendingPosts;

  const links = [
    ...(isModerator
      ? [
          {
            label: SquadTab.Settings,
            url: `${squadLink}/edit`,
          },
        ]
      : []),
    {
      label: pendingTabLabel,
      url: `${webappUrl}squads/moderate?handle=${handle}`,
    },
  ];

  const controlledActive =
    active === SquadTab.PendingPosts ? pendingTabLabel : active;

  return (
    <TabContainer
      shouldMountInactive
      controlledActive={controlledActive}
      className={{ header: 'tablet:px-4' }}
    >
      {links.map(({ label, url }) => (
        <Tab key={label} label={label} url={url} />
      ))}
    </TabContainer>
  );
}
