import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserStreak } from '../../graphql/users';
import {
  formatStreakPauseDate,
  useActiveStreakPause,
} from '../../hooks/streaks/useStreakPause';
import { PauseIcon } from '../icons';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

interface StreakPauseBannerProps {
  streak?: UserStreak;
  className?: string;
}

// Shown on the streak surfaces while a scheduled pause covers today. Renders
// null unless the streak_pause flag is on.
export const StreakPauseBanner = ({
  streak,
  className,
}: StreakPauseBannerProps): ReactElement | null => {
  const { pause, isActive } = useActiveStreakPause(streak);

  if (!pause || !isActive) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex items-center gap-2 rounded-10 bg-surface-float px-3 py-2 text-text-tertiary',
        className,
      )}
    >
      <PauseIcon size={IconSize.Small} />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
        Paused until {formatStreakPauseDate(pause.end)}
      </Typography>
    </div>
  );
};
