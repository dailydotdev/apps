import React, { ReactElement, useMemo } from 'react';
import { TabContainer, Tab } from '../tabs/TabContainer';
import { webappUrl } from '../../lib/constants';

export enum SquadTab {
  Settings = 'Settings',
  PendingPosts = 'Pending posts',
}

interface SquadTabsProps {
  active: SquadTab;
  handle: string;
  pendingCount?: number;
  showSettings?: boolean;
}

export function SquadTabs({
  active,
  handle,
  pendingCount,
  showSettings = false,
}: SquadTabsProps): ReactElement {
  const pendingTitle = pendingCount
    ? `${SquadTab.PendingPosts} (${pendingCount})`
    : SquadTab.PendingPosts;

  const links = useMemo(() => {
    const host = `${webappUrl}squads/${handle}`;
    return {
      ...(showSettings && { [SquadTab.Settings]: `${host}/edit` }),
      [pendingTitle]: `${host}/moderate`,
    };
  }, [handle, pendingTitle, showSettings]);

  const controlledActive =
    active === SquadTab.PendingPosts ? pendingTitle : active;

  return (
    <TabContainer shouldMountInactive controlledActive={controlledActive}>
      {Object.entries(links).map(([label, url]) => (
        <Tab key={label} label={label} url={url} />
      ))}
    </TabContainer>
  );
}
