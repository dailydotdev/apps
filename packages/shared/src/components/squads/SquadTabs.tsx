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
  const links = useMemo(() => {
    const host = `${webappUrl}squads/${handle}`;
    const title = pendingCount
      ? `${SquadTab.PendingPosts} (${pendingCount})`
      : SquadTab.PendingPosts;

    return {
      ...(showSettings && { [SquadTab.Settings]: `${host}/edit` }),
      [title]: `${host}/moderate`,
    };
  }, [handle, pendingCount, showSettings]);

  return (
    <TabContainer shouldMountInactive controlledActive={active}>
      {Object.entries(links).map(([label, url]) => (
        <Tab key={label} label={label} url={url} />
      ))}
    </TabContainer>
  );
}
