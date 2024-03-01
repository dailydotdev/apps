import React, { ReactElement, useState } from 'react';
import { ReadingStreakPopup } from './popup';
import { Button, ButtonVariant } from '../buttons/Button';
import { ReadingStreakIcon } from '../icons';
import { SimpleTooltip } from '../tooltips';
import { UserStreak } from '../../graphql/users';

interface ReadingStreakButtonProps {
  streak: UserStreak;
}

export function ReadingStreakButton({
  streak,
}: ReadingStreakButtonProps): ReactElement {
  const [shouldShowStreaks, setShouldShowStreaks] = useState(false);
  const hasReadToday =
    new Date(streak.lastViewAt).getDate() === new Date().getDate();

  return (
    <SimpleTooltip
      interactive
      showArrow={false}
      visible={shouldShowStreaks}
      container={{
        paddingClassName: 'p-4',
        bgClassName: 'bg-theme-bg-tertiary',
        textClassName: 'text-theme-label-primary typo-callout',
        className: 'border border-theme-divider-tertiary',
      }}
      content={<ReadingStreakPopup streak={streak} />}
      onClickOutside={() => setShouldShowStreaks(false)}
    >
      <Button
        type="button"
        icon={<ReadingStreakIcon secondary={hasReadToday} />}
        variant={ButtonVariant.Float}
        onClick={() => setShouldShowStreaks((state) => !state)}
        className="gap-1 text-theme-color-bacon"
      >
        {streak?.current}
      </Button>
    </SimpleTooltip>
  );
}
