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

// The streak rail tab's panel, ordered by how often each block matters (a la
// Duolingo's "daily habit → today's goals → reference last"):
//   1. Reading streak — the hero (the panel title already reads "Streak").
//   2. Quests — the same daily/weekly panel as the /daily-quests page.
//   3. Game Center / Quests settings — low-frequency reference links, demoted
//      to the bottom so they don't sit between the two primary modules.
// Everything here is composed from existing components — only the layout,
// grouping and hierarchy changed.
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
    <div className="flex flex-col pb-2">
      {/* 1. Reading streak — the hero. */}
      {isStreaksEnabled && streak && (
        <>
          <div className="px-4 pb-3 pt-1">
            <ReadingStreakPopup streak={streak} fullWidth />
          </div>
          <HorizontalSeparator className="mx-3 w-auto" />
        </>
      )}

      {/* 2. Today's quests (level + daily/weekly). Labelled to read as its own
          module, matching the sidebar's section-header style. */}
      <div className="flex h-9 items-center px-4">
        <span className="text-text-quaternary typo-callout">Quests</span>
      </div>
      <div className="px-2">
        <QuestButton panelOnly />
      </div>

      {/* 3. Reference links / settings — demoted to the bottom. */}
      <HorizontalSeparator className="mx-3 my-2 w-auto" />
      <Section
        {...defaultRenderSectionProps}
        items={linkItems}
        isItemsButton={isItemsButton}
        className="!mt-0"
      />
    </div>
  );
};
