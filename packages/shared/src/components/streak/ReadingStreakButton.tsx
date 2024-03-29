import React, { ReactElement, useCallback, useState } from 'react';
import classnames from 'classnames';
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
  isLoading: boolean;
  compact?: boolean;
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
        bgClassName: 'bg-accent-pepper-subtlest',
        textClassName: 'text-text-primary typo-callout',
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
  isLoading,
  compact,
}: ReadingStreakButtonProps): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [shouldShowStreaks, setShouldShowStreaks] = useState(false);
  const hasReadToday =
    new Date(streak?.lastViewAt).getDate() === new Date().getDate();

  const handleToggle = useCallback(() => {
    setShouldShowStreaks((state) => !state);

    if (!shouldShowStreaks) {
      trackEvent({
        event_name: AnalyticsEvent.OpenStreaks,
      });
    }
  }, [shouldShowStreaks, trackEvent]);

  const Tooltip = shouldShowStreaks ? CustomStreaksTooltip : SimpleTooltip;

  if (isLoading) {
    return (
      <div className="h-8 w-14 rounded-12 bg-surface-float laptop:h-10 laptop:w-20" />
    );
  }

  if (!streak) {
    return null;
  }

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
        className={classnames('gap-1', compact && 'text-theme-color-bacon')}
        size={
          (isLaptop || !compact) && !isMobile
            ? ButtonSize.Medium
            : ButtonSize.Small
        }
      >
        {streak?.current}
        {!compact && ' reading days'}
      </Button>
    </Tooltip>
  );
}
