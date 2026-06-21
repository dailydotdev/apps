import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import type { SidebarMenuItem } from '../common';
import { ListIcon, isSidebarItemActive } from '../common';
import { JoystickIcon, SettingsIcon } from '../../icons';
import { Section } from '../Section';
import type { SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useStreakRingState } from '../../../hooks/streaks/useStreakRingState';
import { StreakMonthCalendar } from '../../streak/popup/StreakMonthCalendar';
import { QuestButton } from '../../quest/QuestButton';
import { HorizontalSeparator } from '../../utilities';
import Link from '../../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { IconSize } from '../../Icon';
import { DEFAULT_TIMEZONE } from '../../../lib/timezones';

// The streak rail tab's panel, ordered by how often each block matters (a la
// Duolingo's "daily habit → today's goals → reference last"):
//   1. Reading streak hero — a big current-streak number with an inline
//      current/longest/total line, a dated header, and the 30-day calendar.
//   2. Quests — the daily/weekly panel, height-capped so it never dominates.
//   3. Game Center / Quests settings — low-frequency reference links, last.
// Composed from existing streak/quest components; only layout and grouping are
// new here.
export const StreakQuestsSection = ({
  isItemsButton,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { activePage } = defaultRenderSectionProps;
  const { user } = useAuthContext();
  const { isEnabled: isStreakEnabled, count, streak } = useStreakRingState();
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const todayLabel = useMemo(() => format(new Date(), 'MMMM d, yyyy'), []);

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
          <div className="flex flex-col px-4 pb-4 pt-1">
            <div className="flex items-start justify-between">
              <Typography
                type={TypographyType.Mega1}
                color={TypographyColor.Primary}
                bold
                className="tabular-nums leading-none"
              >
                {count}
              </Typography>
              <Link href={`${webappUrl}account/customization/streaks`} passHref>
                <a
                  aria-label="Streak settings"
                  className="focus-outline -mr-1 flex size-8 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  <SettingsIcon size={IconSize.Small} />
                </a>
              </Link>
            </div>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="mt-1.5"
            >
              Current streak · {streak.max} Longest · {streak.total} Total
            </Typography>
            <div className="mb-2 mt-5 flex items-center justify-between gap-2">
              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Primary}
                bold
                truncate
                className="min-w-0"
              >
                Today, {todayLabel}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="shrink-0"
              >
                {timezone}
              </Typography>
            </div>
            <StreakMonthCalendar streak={streak} />
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
