import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon, isSidebarItemActive } from '../common';
import { JoystickIcon, SettingsIcon } from '../../icons';
import { Section } from '../Section';
import type { SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';
import { useReadingStreak } from '../../../hooks/streaks/useReadingStreak';
import { ReadingStreakPopup } from '../../streak/popup/ReadingStreakPopup';
import { QuestButton } from '../../quest/QuestButton';
import { HorizontalSeparator } from '../../utilities';

// The streak rail tab's panel: the full reading-streak details up top, then the
// Game Center / settings links, then the daily quests (the same panel as the
// /daily-quests page) rendered inline.
export const StreakQuestsSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { activePage } = defaultRenderSectionProps;
  const { streak, isStreaksEnabled } = useReadingStreak();

  const linkItems: SidebarMenuItem[] = useMemo(() => {
    const gameCenterPath = `${webappUrl}game-center`;
    // Category-owned settings shortcut: keeps the streak/Game Center panel
    // active (the canonical /settings/... gamification page keeps Settings).
    const questsSettingsPath = `${webappUrl}game-center/settings`;

    return [
      {
        title: 'Game Center',
        path: gameCenterPath,
        active: isSidebarItemActive(activePage, gameCenterPath),
        icon: (active: boolean) => (
          <ListIcon Icon={() => <JoystickIcon secondary={active} />} />
        ),
      },
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
    <div className="flex flex-col">
      {isStreaksEnabled && streak && (
        <>
          <div className="px-4 pb-2 pt-1">
            <ReadingStreakPopup streak={streak} fullWidth />
          </div>
          <HorizontalSeparator className="mx-3 mb-2 w-auto" />
        </>
      )}
      <Section
        {...defaultRenderSectionProps}
        items={linkItems}
        isItemsButton={isItemsButton}
        className="!mt-0"
      />
      <HorizontalSeparator className="mx-3 my-2 w-auto" />
      <div className="px-2 pb-2">
        <QuestButton panelOnly />
      </div>
    </div>
  );
};
