import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { SettingsIcon } from '../../icons';
import { webappUrl } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useStreakRingState } from '../../../hooks/streaks/useStreakRingState';
import { StreakMonthCalendar } from '../../streak/popup/StreakMonthCalendar';
import { CompactQuestList } from '../../quest/CompactQuestList';
import { HorizontalSeparator } from '../../utilities';
import Link from '../../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { IconSize } from '../../Icon';
import { DEFAULT_TIMEZONE } from '../../../lib/timezones';

// The streak rail tab's panel: a big current-streak hero with the 30-day
// calendar, then today's quests. The single gear opens the combined
// Streaks & gamification settings (kept under /game-center/* so this panel
// stays active). The Game Center and separate Quests-settings links are gone —
// clicking the tab itself opens Game Center, and the two settings pages are now
// one, so neither needs repeating here.
export const StreakQuestsSection = (): ReactElement => {
  const { user } = useAuthContext();
  const { isEnabled: isStreakEnabled, count, streak } = useStreakRingState();
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const todayLabel = useMemo(() => format(new Date(), 'MMMM d, yyyy'), []);

  return (
    <div className="flex flex-col pb-2">
      {/* Reading streak — the hero. */}
      {isStreakEnabled && streak && (
        <>
          <div className="flex flex-col px-4 pb-4 pt-1">
            <div className="flex items-start justify-between">
              <Typography
                type={TypographyType.Title1}
                color={TypographyColor.Primary}
                bold
                className="tabular-nums leading-none"
              >
                {count}
              </Typography>
              <Link href={`${webappUrl}game-center/settings`} passHref>
                <a
                  aria-label="Streak & gamification settings"
                  className="focus-outline -mr-1 flex size-8 items-center justify-center rounded-10 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  <SettingsIcon size={IconSize.Small} />
                </a>
              </Link>
            </div>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="mt-1 tabular-nums"
            >
              Current streak · {streak.max} Longest · {streak.total} Total
            </Typography>
            <div className="mb-2 mt-5 flex items-center justify-between gap-2">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Primary}
                bold
                truncate
                className="min-w-0"
              >
                Today, {todayLabel}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
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

      {/* Today's quests, capped so the list never crowds out the rest. */}
      <div className="flex h-9 items-center px-4">
        <span className="text-text-quaternary typo-callout">Quests</span>
      </div>
      <div className="max-h-96 overflow-y-auto px-4">
        <CompactQuestList />
      </div>
    </div>
  );
};
