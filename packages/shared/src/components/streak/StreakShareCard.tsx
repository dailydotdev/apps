import type { ReactElement } from 'react';
import React from 'react';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';
import { ReadingStreakIcon } from '../icons';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { PublicUserStreak } from '../../graphql/users';

const Stat = ({
  value,
  label,
}: {
  value: number;
  label: string;
}): ReactElement => (
  <span className="flex flex-1 flex-col items-center">
    <Typography type={TypographyType.Title3} bold className="tabular-nums">
      {value}
    </Typography>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Quaternary}
    >
      {label}
    </Typography>
  </span>
);

// Rendered headless by the screenshot service (see
// `webapp/pages/image-generator/streak/[userId]`), so it must stay
// self-contained: no context, no data fetching, fixed size.
export function StreakShareCard({
  streak,
}: {
  streak: PublicUserStreak;
}): ReactElement {
  return (
    <div className="flex h-80 w-80 flex-col items-center justify-between rounded-24 border border-border-subtlest-tertiary bg-background-default p-6 text-center text-text-primary">
      <div className="flex items-center gap-1">
        <LogoIcon className={{ container: 'h-logo' }} />
        <LogoText className={{ container: 'h-logo' }} />
      </div>

      <div className="flex flex-col items-center gap-1">
        <ReadingStreakIcon secondary size={IconSize.XXXLarge} />
        <Typography
          type={TypographyType.Mega1}
          bold
          className="tabular-nums"
          data-testid="streak-share-current"
        >
          {streak.current}
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          day reading streak
        </Typography>
      </div>

      <div className="flex w-full gap-2">
        <Stat value={streak.max} label="Longest streak" />
        <Stat value={streak.total} label="Total reading days" />
      </div>
    </div>
  );
}
