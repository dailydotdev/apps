import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classnames from 'classnames';
import { ReadingStreakPopup } from './popup/ReadingStreakPopup';
import type { ButtonIconPosition } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
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
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';

interface ReadingStreakButtonProps {
  streak: UserStreak;
  isLoading: boolean;
  compact?: boolean;
  iconPosition?: ButtonIconPosition;
  className?: string;
  // Portal the popup to <body> so it escapes parents with `overflow:hidden`
  // (e.g. the sidebar panel). Pair with `zIndex` so it stacks above the
  // sidebar surface.
  appendTooltipToBody?: boolean;
  zIndex?: number;
}

interface CustomStreaksTooltipProps {
  streak: UserStreak;
  children?: ReactElement;
  shouldShowStreaks?: boolean;
  setShouldShowStreaks?: (value: boolean) => void;
  placement: TooltipPosition;
  appendTooltipToBody?: boolean;
  zIndex?: number;
}

function CustomStreaksTooltip({
  streak,
  children,
  shouldShowStreaks,
  setShouldShowStreaks,
  placement,
  appendTooltipToBody,
  zIndex,
}: CustomStreaksTooltipProps): ReactElement {
  return (
    <SimpleTooltip
      interactive
      showArrow={false}
      placement={placement}
      visible={shouldShowStreaks}
      forceLoad={!isTesting}
      appendTo={appendTooltipToBody ? () => document.body : undefined}
      zIndex={zIndex}
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
  appendTooltipToBody,
  zIndex,
}: ReadingStreakButtonProps): ReactElement {
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = useViewSize(ViewSize.MobileL);
  const { isV2 } = useLayoutVariant();
  const [shouldShowStreaks, setShouldShowStreaks] = useState(false);
  const hasReadToday =
    streak?.lastViewAt &&
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
        wrapper={(children: ReactElement) => (
          <Tooltip
            content="Current streak"
            streak={streak}
            shouldShowStreaks={shouldShowStreaks}
            setShouldShowStreaks={setShouldShowStreaks}
            placement={!isMobile && !isLaptop ? 'bottom-start' : 'bottom-end'}
            appendTooltipToBody={appendTooltipToBody}
            zIndex={zIndex}
          >
            {children}
          </Tooltip>
        )}
      >
        <Button
          id="reading-streak-header-button"
          type="button"
          iconPosition={iconPosition}
          icon={
            <IconWrapper
              size={compact ? IconSize.XSmall : undefined}
              wrapperClassName={classnames(
                'relative flex items-center gap-2',
                compact && 'h-6 w-6 justify-center',
              )}
            >
              <ReadingStreakIcon secondary={hasReadToday} />
              {!isTimezoneOk && (
                <WarningIcon className="!mr-0 text-raw-cheese-40" secondary />
              )}
            </IconWrapper>
          }
          variant={
            compact || isLaptop || isMobile
              ? ButtonVariant.Tertiary
              : ButtonVariant.Float
          }
          onClick={handleToggle}
          className={classnames(isV2 ? 'gap-0.5' : 'gap-1', className)}
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
