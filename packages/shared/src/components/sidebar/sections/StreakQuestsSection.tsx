import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import { ArrowIcon, SettingsIcon } from '../../icons';
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
import { Tooltip } from '../../tooltip/Tooltip';
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
  // Compact label (e.g. "Jun 23") — no year; the full date with year lives in
  // the hover tooltip so the strip stays tidy day-to-day.
  const todayLabel = useMemo(() => format(new Date(), 'MMM d'), []);
  const fullDateLabel = useMemo(() => format(new Date(), 'MMMM d, yyyy'), []);
  const [questsOpen, setQuestsOpen] = useState(true);

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
              className="mt-1"
            >
              Current streak
            </Typography>
            {/* Longest/Total on their own row so the line never wraps and isn't
                jammed with the current-streak label. */}
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="mt-0.5 tabular-nums"
            >
              {streak.max} Longest · {streak.total} Total
            </Typography>
            <div className="mb-5 mt-5 flex items-center justify-between gap-2">
              <Tooltip side="top" content={fullDateLabel}>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Primary}
                  bold
                  truncate
                  className="min-w-0"
                >
                  Today, {todayLabel}
                </Typography>
              </Tooltip>
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

      {/* Today's quests, capped so the list never crowds out the rest. The
          header mirrors the standard sidebar section title (typo-callout
          quaternary + hover-revealed collapse arrow) used by Bookmarks/Recent
          so it reads the same across panels. */}
      <div className="group/section">
        <div className="flex min-h-9 items-center px-3">
          <button
            type="button"
            onClick={() => setQuestsOpen((open) => !open)}
            aria-label="Toggle Daily quests"
            aria-expanded={questsOpen}
            className="flex items-center gap-1 rounded-6 px-1 py-0.5 transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <span className="text-text-quaternary typo-callout">
              Daily quests
            </span>
            <ArrowIcon
              size={IconSize.XXSmall}
              className={classNames(
                'text-text-quaternary opacity-0 transition-[transform,opacity] duration-200 group-focus-within/section:opacity-100 group-hover/section:opacity-100',
                questsOpen ? 'rotate-180' : 'rotate-90',
              )}
            />
          </button>
        </div>
        <div
          className={classNames(
            'grid transition-[grid-template-rows,opacity] duration-300',
            questsOpen
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="max-h-96 overflow-y-auto px-4 pb-2">
              <CompactQuestList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
