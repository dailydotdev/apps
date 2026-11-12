import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { format, parse } from 'date-fns';
import type { UserStreak } from '../../graphql/users';
import { FeedbackCategory } from '../../graphql/feedback';
import { useStreakResetReason } from '../../hooks/streaks/useStreakResetReason';
import { useLazyModal } from '../../hooks/useLazyModal';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useLogContext } from '../../contexts/LogContext';
import { LazyModal } from '../modals/common/types';
import { LogEvent, TargetType } from '../../lib/log';
import { getTimezoneNameWithOffset } from '../../lib/timezones';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

// missedDate is a plain local date (YYYY-MM-DD), so format it as such instead
// of turning it into an instant that could shift a day in the device zone.
const formatMissedDate = (missedDate: string): string => {
  const parsed = parse(missedDate, 'yyyy-MM-dd', new Date());

  return Number.isNaN(parsed.getTime()) ? missedDate : format(parsed, 'MMM d');
};

interface StreakResetReasonProps {
  streak?: UserStreak;
  className?: string;
}

// "Why it broke": the missed day behind the most recent reset, with a feedback
// entry for users who think the reset is wrong. Renders null unless the
// streak_why_broke flag is on and the reset is still recent (see the hook).
export const StreakResetReason = ({
  streak,
  className,
}: StreakResetReasonProps): ReactElement | null => {
  const { isVisible, missedDate, timezone, at } = useStreakResetReason(streak);
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.StreakResetReason,
      target_id: missedDate,
      extra: JSON.stringify({ timezone, reset_at: at }),
    }),
    { condition: isVisible },
  );

  if (!isVisible || !missedDate) {
    return null;
  }

  const dateLabel = formatMissedDate(missedDate);
  const timezoneLabel = getTimezoneNameWithOffset(timezone);

  const onTellUs = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.StreakResetReason,
      target_id: missedDate,
      extra: JSON.stringify({ timezone, reset_at: at }),
    });
    openModal({
      type: LazyModal.Feedback,
      props: {
        initialCategory: FeedbackCategory.BugReport,
        initialDescription: `My reading streak reset because no read was recorded on ${dateLabel} in ${timezoneLabel}. I think this is wrong because `,
      },
    });
  };

  return (
    <div className={classNames('flex flex-col gap-1', className)}>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        No read was recorded on {dateLabel} in {timezoneLabel}.
      </Typography>
      <button
        type="button"
        onClick={onTellUs}
        className="focus-outline self-start text-text-link underline typo-footnote"
      >
        Think this is wrong? Tell us
      </button>
    </div>
  );
};
