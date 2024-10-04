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
}

export function SquadTabs({ active, handle }: SquadTabsProps): ReactElement {
  const links = useMemo(() => {
    const host = `${webappUrl}squads/${handle}`;

    return {
      [SquadTab.Settings]: `${host}/edit`,
      [SquadTab.PendingPosts]: `${host}/moderate`,
    };
  }, [handle]);

  return (
    <TabContainer shouldMountInactive controlledActive={active}>
      {Object.entries(links).map(([label, url]) => (
        <Tab key={label} label={label} url={url} />
      ))}
    </TabContainer>
  );
}
