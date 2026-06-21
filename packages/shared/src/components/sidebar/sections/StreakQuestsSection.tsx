import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { SidebarMenuItem } from '../common';
import { ListIcon, isSidebarItemActive } from '../common';
import { JoystickIcon, SettingsIcon } from '../../icons';
import { Section } from '../Section';
import { StreakBadge } from '../StreakBadge';
import type { SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';
import { useStreakRingState } from '../../../hooks/streaks/useStreakRingState';
import { useStreakDays } from '../../../hooks/streaks/useStreakDays';
import { StreakSection } from '../../streak/popup/StreakSection';
import { DayStreak } from '../../streak/popup/DayStreak';
import { QuestButton } from '../../quest/QuestButton';
import { HorizontalSeparator } from '../../utilities';
import { IconSize } from '../../Icon';

// The streak rail tab's panel, ordered by how often each block matters (a la
// Duolingo's "daily habit → today's goals → reference last"):
//   1. Reading streak hero — the state-aware StreakBadge + current/longest +
//      a compact day strip (the same DayStreak cells the popup uses, just laid
//      out tightly here instead of the full popup's metadata/timezone/push).
//   2. Quests — the daily/weekly panel, height-capped so it never dominates.
//   3. Game Center / Quests settings — low-frequency reference links, last.
// Composed from existing streak/quest components; only layout and grouping are
// new here.
export const StreakQuestsSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { activePage } = defaultRenderSectionProps;
  const {
    isEnabled: isStreakEnabled,
    state,
    hasReadToday,
    streak,
  } = useStreakRingState();
  const days = useStreakDays(streak);

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
      {isStreakEnabled && streak && (
        <>
          <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
            <div className="flex items-center gap-3">
              <StreakBadge
                state={state}
                hasReadToday={hasReadToday}
                size="lg"
              />
              <div className="flex flex-1 gap-4">
                <StreakSection streak={streak.current} label="Current streak" />
                <StreakSection streak={streak.max} label="Longest streak 🏆" />
              </div>
            </div>
            <div className="flex justify-between">
              {days.map((day) => (
                <DayStreak
                  key={day.date.getTime()}
                  streak={day.streak}
                  date={day.date}
                  shouldShowArrow={day.isToday}
                  size={IconSize.Small}
                />
              ))}
            </div>
          </div>
          <HorizontalSeparator className="mx-3 w-auto" />
        </>
      )}

      {/* 2. Today's quests, capped so the list never crowds out the rest. */}
      <div className="flex h-9 items-center px-4">
        <span className="text-text-quaternary typo-callout">Quests</span>
      </div>
      <div className="max-h-96 overflow-y-auto px-2">
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
