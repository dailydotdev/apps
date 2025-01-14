import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classnames from 'classnames';
import { ReadingStreakPopup } from './popup';
import type { ButtonIconPosition } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ReadingStreakIcon } from '../icons';
import { SimpleTooltip } from '../tooltips';
import type { UserStreak } from '../../graphql/users';
import { useViewSize, ViewSize } from '../../hooks';
import { isTesting } from '../../lib/constants';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { RootPortal } from '../tooltips/Portal';
import { Drawer } from '../drawers';
import ConditionalWrapper from '../ConditionalWrapper';
import type { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { useAuthContext } from '../../contexts/AuthContext';
import { getDayOfMonthInTimezone } from '../../lib/timezones';

interface ReadingStreakButtonProps {
  streak: UserStreak;
  isLoading: boolean;
  compact?: boolean;
  iconPosition?: ButtonIconPosition;
  className?: string;
}

interface CustomStreaksTooltipProps {
  streak: UserStreak;
  children?: ReactElement;
  shouldShowStreaks?: boolean;
  setShouldShowStreaks?: (value: boolean) => void;
  placement: TooltipPosition;
}

function CustomStreaksTooltip({
  streak,
  children,
  shouldShowStreaks,
  setShouldShowStreaks,
  placement,
}: CustomStreaksTooltipProps): ReactElement {
  return (
    <SimpleTooltip
      interactive
      showArrow={false}
      placement={placement}
      visible={shouldShowStreaks}
      forceLoad={!isTesting}
      container={{
        paddingClassName: 'p-0',
        bgClassName: 'bg-accent-pepper-subtlest',
        textClassName: 'text-text-primary typo-callout',
        className: 'border border-border-subtlest-tertiary rounded-16',
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
  iconPosition,
  className,
}: ReadingStreakButtonProps): ReactElement {
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [shouldShowStreaks, setShouldShowStreaks] = useState(false);
  const hasReadToday =
    streak?.lastViewAt &&
    getDayOfMonthInTimezone(new Date(streak.lastViewAt), user.timezone) ===
      getDayOfMonthInTimezone(new Date(), user.timezone);

  const handleToggle = useCallback(() => {
    setShouldShowStreaks((state) => !state);

    if (!shouldShowStreaks) {
      logEvent({
        event_name: LogEvent.OpenStreaks,
      });
    }
  }, [shouldShowStreaks, logEvent]);

  const Tooltip = shouldShowStreaks ? CustomStreaksTooltip : SimpleTooltip;

  if (isLoading) {
    return <div className="h-8 w-14 rounded-12 bg-surface-float" />;
  }

  if (!streak) {
    return null;
  }

  return (
    <>
      <ConditionalWrapper
        condition={!isMobile}
        wrapper={(children: ReactElement) => (
          <Tooltip
            content="Current streak"
            streak={streak}
            shouldShowStreaks={shouldShowStreaks}
            setShouldShowStreaks={setShouldShowStreaks}
            placement={!isMobile && !isLaptop ? 'bottom-start' : 'bottom-end'}
          >
            {children}
          </Tooltip>
        )}
      >
        <Button
          id="reading-streak-header-button"
          type="button"
          iconPosition={iconPosition}
          icon={<ReadingStreakIcon secondary={hasReadToday} />}
          variant={
            isLaptop || isMobile ? ButtonVariant.Tertiary : ButtonVariant.Float
          }
          onClick={handleToggle}
          className={classnames(
            'gap-1',
            compact && 'text-accent-bacon-default',
            className,
          )}
          size={!compact && !isMobile ? ButtonSize.Medium : ButtonSize.Small}
        >
          {streak?.current}
          {!compact && ' reading days'}
        </Button>
      </ConditionalWrapper>

      {isMobile && (
        <RootPortal>
          <Drawer
            displayCloseButton
            isOpen={shouldShowStreaks}
            onClose={handleToggle}
          >
            <ReadingStreakPopup streak={streak} fullWidth />
          </Drawer>
        </RootPortal>
      )}
    </>
  );
}
