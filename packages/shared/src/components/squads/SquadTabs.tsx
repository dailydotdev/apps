import React, { ReactElement } from 'react';
import { TabContainer, Tab } from '../tabs/TabContainer';
import { webappUrl } from '../../lib/constants';
import { SourcePermissions, Squad } from '../../graphql/sources';
import { verifyPermission } from '../../graphql/squads';

export enum SquadTab {
  Settings = 'Settings',
  PendingPosts = 'Pending posts',
}

interface SquadTabsProps {
  active: SquadTab;
  squad: Squad;
}

export function SquadTabs({ active, squad }: SquadTabsProps): ReactElement {
  const { handle, moderationPostCount } = squad;
  const isModerator = verifyPermission(squad, SourcePermissions.ModeratePost);
  const squadLink = `${webappUrl}squads/${handle}`;
  const pendingTabLabel = moderationPostCount
    ? `${SquadTab.PendingPosts} (${moderationPostCount})`
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
    { label: pendingTabLabel, url: `${squadLink}/moderate` },
  ];

  const controlledActive =
    active === SquadTab.PendingPosts ? pendingTabLabel : active;

  return (
    <TabContainer shouldMountInactive controlledActive={controlledActive}>
      {links.map(({ label, url }) => (
        <Tab key={label} label={label} url={url} />
      ))}
    </TabContainer>
  );
}
