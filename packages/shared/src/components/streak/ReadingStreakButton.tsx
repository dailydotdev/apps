import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classnames from 'classnames';
import { ReadingStreakPopup } from './popup/ReadingStreakPopup';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { ReadingStreakIcon, WarningIcon } from '../icons';
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
import { isSameDayInTimezone } from '../../lib/timezones';
import { IconSize, IconWrapper } from '../Icon';
import { useStreakTimezoneOk } from '../../hooks/streaks/useStreakTimezoneOk';

interface ReadingStreakButtonProps {
  streak: UserStreak;
  isLoading: boolean;
  compact?: boolean;
  iconPosition?: ButtonIconPosition;
  iconSize?: IconSize;
  appendTooltipToBody?: boolean;
  className?: string;
}

interface CustomStreaksTooltipProps {
  streak: UserStreak;
  children?: ReactElement;
  shouldShowStreaks?: boolean;
  setShouldShowStreaks?: (value: boolean) => void;
  placement: TooltipPosition;
  appendTooltipToBody?: boolean;
}

function CustomStreaksTooltip({
  streak,
  children,
  shouldShowStreaks,
  setShouldShowStreaks,
  placement,
  appendTooltipToBody,
}: CustomStreaksTooltipProps): ReactElement {
  return (
    <SimpleTooltip
      interactive
      showArrow={false}
      placement={placement}
      visible={shouldShowStreaks}
      forceLoad={!isTesting}
      appendTo={appendTooltipToBody ? () => document.body : undefined}
      zIndex={1000}
      container={{
        paddingClassName: 'p-0',
        bgClassName: 'bg-accent-pepper-subtlest',
        textClassName: 'text-text-primary typo-callout',
        className: 'border border-border-subtlest-tertiary rounded-16',
      }}
      content={<ReadingStreakPopup streak={streak} />}
      onClickOutside={() => setShouldShowStreaks?.(false)}
    >
      {children}
    </SimpleTooltip>
  );
}

export function ReadingStreakButton({
  streak,
  isLoading,
  compact,
  iconPosition = ButtonIconPosition.Left,
  iconSize,
  appendTooltipToBody,
  className,
}: ReadingStreakButtonProps): ReactElement | null {
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [shouldShowStreaks, setShouldShowStreaks] = useState(false);
  const hasReadToday =
    streak?.lastViewAt &&
    user &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), user.timezone);
  const isTimezoneOk = useStreakTimezoneOk();

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
        wrapper={(children) => (
          <Tooltip
            content="Current streak"
            streak={streak}
            shouldShowStreaks={shouldShowStreaks}
            setShouldShowStreaks={setShouldShowStreaks}
            placement={!isMobile && !isLaptop ? 'bottom-start' : 'bottom-end'}
            appendTooltipToBody={appendTooltipToBody}
          >
            {children as ReactElement}
          </Tooltip>
        )}
      >
        <Button
          id="reading-streak-header-button"
          type="button"
          iconPosition={iconPosition}
          icon={
            <IconWrapper
              size={iconSize}
              wrapperClassName="relative flex items-center gap-2"
            >
              <ReadingStreakIcon secondary={hasReadToday} />
              {!isTimezoneOk && (
                <WarningIcon className="!mr-0 text-raw-cheese-40" secondary />
              )}
            </IconWrapper>
          }
          variant={
            isLaptop || isMobile ? ButtonVariant.Tertiary : ButtonVariant.Float
          }
          onClick={handleToggle}
          className={classnames(
            'gap-0.5',
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
