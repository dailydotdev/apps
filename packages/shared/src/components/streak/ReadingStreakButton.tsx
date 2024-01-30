import React, { ReactElement, useState } from 'react';
import { ReadingStreakPopup } from './popup';
import { Button, ButtonVariant } from '../buttons/ButtonV2';
import { ReadingStreakIcon } from '../icons';
import { SimpleTooltip } from '../tooltips';
import { useReadingStreak } from '../../hooks/streaks';

export function ReadingStreakButton(): ReactElement {
  const [shouldShowStreaks, setShouldShowStreaks] = useState(false);
  const { currentStreak } = useReadingStreak();

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
      content={<ReadingStreakPopup />}
    >
      <Button
        type="button"
        icon={<ReadingStreakIcon />}
        variant={ButtonVariant.Float}
        onClick={() => setShouldShowStreaks((state) => !state)}
        className="gap-1 text-theme-color-bacon"
      >
        {currentStreak}
      </Button>
    </SimpleTooltip>
  );
}
