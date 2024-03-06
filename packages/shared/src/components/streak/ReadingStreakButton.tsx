import React, { ReactElement, useCallback, useState } from 'react';
import { ReadingStreakPopup } from './popup';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ReadingStreakIcon } from '../icons';
import { SimpleTooltip } from '../tooltips';
import { UserStreak } from '../../graphql/users';
import { useViewSize, ViewSize } from '../../hooks';
import { isTesting } from '../../lib/constants';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';

interface ReadingStreakButtonProps {
  streak: UserStreak;
}

interface CustomStreaksTooltipProps {
  streak: UserStreak;
  children?: ReactElement;
  shouldShowStreaks?: boolean;
  setShouldShowStreaks?: (value: boolean) => void;
}

function CustomStreaksTooltip({
  streak,
  children,
  shouldShowStreaks,
  setShouldShowStreaks,
}: CustomStreaksTooltipProps): ReactElement {
  return (
    <SimpleTooltip
      interactive
      showArrow={false}
      visible={shouldShowStreaks}
      forceLoad={!isTesting}
      container={{
        paddingClassName: 'p-4',
        bgClassName: 'bg-theme-bg-tertiary',
        textClassName: 'text-theme-label-primary typo-callout',
        className: 'border border-theme-divider-tertiary',
      }}
      content={<ReadingStreakPopup streak={streak} />}
      onClickOutside={() => setShouldShowStreaks(false)}
    >
      {children}
    </SimpleTooltip>
  );
}

export function ReadingStreakButton({
  streak,
}: ReadingStreakButtonProps): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [shouldShowStreaks, setShouldShowStreaks] = useState(false);
  const hasReadToday =
    new Date(streak.lastViewAt).getDate() === new Date().getDate();

  const handleToggle = useCallback(() => {
    setShouldShowStreaks((state) => !state);

    if (!shouldShowStreaks) {
      trackEvent({
        event_name: AnalyticsEvent.OpenStreaks,
      });
    }
  }, [shouldShowStreaks, trackEvent]);

  const Tooltip = shouldShowStreaks ? CustomStreaksTooltip : SimpleTooltip;

  return (
    <Tooltip
      content="Current streak"
      streak={streak}
      shouldShowStreaks={shouldShowStreaks}
      setShouldShowStreaks={setShouldShowStreaks}
    >
      <Button
        type="button"
        icon={<ReadingStreakIcon secondary={hasReadToday} />}
        variant={ButtonVariant.Float}
        onClick={handleToggle}
        className="gap-1 text-theme-color-bacon"
        size={isLaptop ? ButtonSize.Medium : ButtonSize.Small}
      >
        {streak?.current}
      </Button>
    </Tooltip>
  );
}
