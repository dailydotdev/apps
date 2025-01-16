import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import { addDays, subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { StreakSection } from './StreakSection';
import { DayStreak, Streak } from './DayStreak';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import type { ReadingDay, UserStreak } from '../../../graphql/users';
import { getReadingStreak30Days } from '../../../graphql/users';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions, useViewSize, ViewSize } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { Button, ButtonVariant } from '../../buttons/Button';
import { SettingsIcon } from '../../icons';
import StreakReminderSwitch from '../StreakReminderSwitch';
import ReadingStreakSwitch from '../ReadingStreakSwitch';
import { useToggle } from '../../../hooks/useToggle';
import { ToggleWeekStart } from '../../widgets/ToggleWeekStart';
import { isWeekend, DayOfWeek } from '../../../lib/date';
import {
  DEFAULT_TIMEZONE,
  getTimezoneOffsetLabel,
  isSameDayInTimezone,
} from '../../../lib/timezones';
import { SimpleTooltip } from '../../tooltips';
import { isTesting } from '../../../lib/constants';
import {
  timezoneMismatchIgnoreKey,
  useStreakTimezoneOk,
} from '../../../hooks/streaks/useStreakTimezoneOk';
import { usePrompt } from '../../../hooks/usePrompt';
import usePersistentContext from '../../../hooks/usePersistentContext';

const getStreak = ({
  value,
  today,
  history,
  startOfWeek = DayOfWeek.Monday,
  timezone,
}: {
  value: Date;
  today: Date;
  history?: ReadingDay[];
  startOfWeek?: number;
  timezone?: string;
}): Streak => {
  const isFreezeDay = isWeekend(value, startOfWeek, timezone);
  const isToday = isSameDayInTimezone(value, today, timezone);
  const isFuture = value > today;
  const isCompleted =
    !isFuture &&
    history?.some(({ date: historyDate, reads }) => {
      const dateToCompare = new Date(historyDate);
      const sameDate = isSameDayInTimezone(dateToCompare, value, timezone);

      return sameDate && reads > 0;
    });

  if (isCompleted) {
    return Streak.Completed;
  }

  if (isFreezeDay) {
    return Streak.Freeze;
  }

  if (isToday) {
    return Streak.Pending;
  }

  return Streak.Upcoming;
};

const getStreakDays = (today: Date) => {
  return [
    subDays(today, 4),
    subDays(today, 3),
    subDays(today, 2),
    subDays(today, 1),
    today,
    addDays(today, 1),
    addDays(today, 2),
    addDays(today, 3),
    addDays(today, 4),
  ]; // these dates will then be compared to the user's post views
};

interface ReadingStreakPopupProps {
  streak: UserStreak;
  fullWidth?: boolean;
}

const timezoneSettingsHref = '/account/notifications?s=timezone';

export function ReadingStreakPopup({
  streak,
  fullWidth,
}: ReadingStreakPopupProps): ReactElement {
  const router = useRouter();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { user } = useAuthContext();
  const { completeAction } = useActions();
  const { data: history } = useQuery<ReadingDay[]>({
    queryKey: generateQueryKey(RequestKey.ReadingStreak30Days, user),
    queryFn: () => getReadingStreak30Days(user.id),
    staleTime: StaleTime.Default,
  });
  const [showStreakConfig, toggleShowStreakConfig] = useToggle(false);
  const isTimezoneOk = useStreakTimezoneOk();
  const { showPrompt } = usePrompt();
  const [, setTimezoneMismatchIgnore] = usePersistentContext(
    timezoneMismatchIgnoreKey,
    '',
  );

  const streaks = useMemo(() => {
    const today = new Date();
    const streakDays = getStreakDays(today);

    return streakDays.map((value) => {
      const isToday = isSameDayInTimezone(value, today, user.timezone);

      const streakDef = getStreak({
        value,
        today,
        history,
        startOfWeek: streak.weekStart,
        timezone: user.timezone,
      });

      return (
        <DayStreak
          key={value.getTime()}
          streak={streakDef}
          date={value}
          shouldShowArrow={isToday}
          onClick={() => toggleShowStreakConfig()}
        />
      );
    });
  }, [history, streak.weekStart, toggleShowStreakConfig, user.timezone]);

  useEffect(() => {
    if ([streak.max, streak.current].some((value) => value >= 2)) {
      completeAction(ActionType.StreakMilestone);
    }
  }, [completeAction, streak]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col p-0 tablet:p-4">
        <div className="flex flex-row">
          <StreakSection streak={streak.current} label="Current streak" />
          <StreakSection streak={streak.max} label="Longest streak 🏆" />
        </div>
        <div
          className={classNames(
            'mt-6 flex flex-row gap-2',
            fullWidth && 'justify-between',
          )}
        >
          {streaks}
        </div>
        <div className="mt-4 flex flex-col items-center tablet:flex-row">
          <div
            className={classNames(
              'flex w-full flex-row flex-wrap justify-center gap-2 font-bold text-text-tertiary tablet:w-auto tablet:flex-col tablet:items-start tablet:gap-1',
              isMobile && 'my-4 flex-1 text-center',
            )}
          >
            <div className="m-auto tablet:m-0">
              Total reading days: {streak.total}
            </div>
            <SimpleTooltip
              placement="bottom"
              forceLoad={!isTesting}
              content={
                <div className="flex text-center">
                  {isTimezoneOk ? (
                    <>
                      We are showing your reading streak in your selected
                      timezone.
                      <br />
                      Click to adjust your timezone if needed or traveling.
                    </>
                  ) : (
                    <>Click for more info</>
                  )}
                </div>
              }
            >
              <div className="m-auto flex justify-center font-normal !text-text-quaternary underline decoration-raw-pepper-10 tablet:m-0 tablet:justify-start">
                <Link
                  onClick={async (event) => {
                    if (isTimezoneOk) {
                      return;
                    }

                    event.preventDefault();

                    const deviceTimezone =
                      Intl.DateTimeFormat().resolvedOptions().timeZone;

                    const promptResult = await showPrompt({
                      title: 'Streak timezone mismatch',
                      description: `We detected your current timezone setting ${getTimezoneOffsetLabel(
                        user?.timezone,
                      )} does not match your current device timezone ${getTimezoneOffsetLabel(
                        deviceTimezone,
                      )}. You can update your timezone in settings.`,
                      okButton: {
                        title: 'Go to settings',
                      },
                      cancelButton: {
                        title: 'Ignore',
                      },
                    });

                    if (!promptResult) {
                      setTimezoneMismatchIgnore(deviceTimezone);

                      return;
                    }

                    router.push(timezoneSettingsHref);
                  }}
                  href={timezoneSettingsHref}
                >
                  {isTimezoneOk
                    ? user.timezone || DEFAULT_TIMEZONE
                    : 'Timezone mismatch ⚠️'}
                </Link>
              </div>
            </SimpleTooltip>
          </div>
          <Button
            onClick={() => toggleShowStreakConfig()}
            variant={ButtonVariant.Float}
            pressed={showStreakConfig}
            icon={<SettingsIcon />}
            className={classNames(
              isMobile ? 'w-full' : 'ml-auto',
              isMobile && showStreakConfig && 'hidden',
            )}
          >
            {isMobile ? 'Settings' : null}
          </Button>
        </div>
      </div>
      {showStreakConfig && (
        <div className="flex flex-col gap-5 border-t border-border-subtlest-tertiary p-4">
          <div className="flex flex-col gap-3">
            <p className="font-bold text-text-secondary typo-subhead">
              General
            </p>
            <StreakReminderSwitch />
            <ReadingStreakSwitch />
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-bold text-text-secondary typo-subhead">
              Freeze days
            </p>
            <ToggleWeekStart />
          </div>
        </div>
      )}
    </div>
  );
}
