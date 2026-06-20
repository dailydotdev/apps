import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import {
  createSidebarSeparatorItem,
  ListIcon,
  isSidebarItemActive,
} from '../common';
import { JoystickIcon, SettingsIcon } from '../../icons';
import { Section } from '../Section';
import type { SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';
import { QuestRailIcon } from '../../quest/QuestRailIcon';

// Daily quests (rail-icon landing) → Game Center hub → Quests settings.
// Rendered as a regular Section so its rows share the exact same layout,
// spacing, and active-state treatment as every other v2 rail panel.
export const GameCenterSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { activePage } = defaultRenderSectionProps;
  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const dailyQuestsPath = `${webappUrl}daily-quests`;
    const gameCenterPath = `${webappUrl}game-center`;
    // Category-owned settings shortcut: keeps the Game Center panel active
    // (the canonical /settings/customization/gamification page keeps Settings).
    const questsSettingsPath = `${webappUrl}game-center/settings`;

    return [
      {
        title: 'Daily quests',
        path: dailyQuestsPath,
        active: isSidebarItemActive(activePage, dailyQuestsPath),
        icon: (active: boolean) => <QuestRailIcon active={active} />,
      },
      {
        title: 'Game Center',
        path: gameCenterPath,
        active: isSidebarItemActive(activePage, gameCenterPath),
        icon: (active: boolean) => (
          <ListIcon Icon={() => <JoystickIcon secondary={active} />} />
        ),
      },
      createSidebarSeparatorItem('quests-settings-divider'),
      {
        title: 'Quests settings',
        path: questsSettingsPath,
        active: isSidebarItemActive(activePage, questsSettingsPath),
        icon: (active: boolean) => (
          <ListIcon Icon={() => <SettingsIcon secondary={active} />} />
        ),
      },
    ];
  }, [activePage]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
    />
  );
};
