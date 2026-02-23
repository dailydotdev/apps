import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classnames from 'classnames';
import { ReadingStreakPopup } from './popup';
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
import { IconWrapper } from '../Icon';
import { useStreakTimezoneOk } from '../../hooks/streaks/useStreakTimezoneOk';
import { AnimatedNumber } from './AnimatedNumber';
import { useStreakIncrement } from '../../hooks/streaks/useStreakIncrement';
import {
  useStreakUrgency,
  UrgencyLevel,
} from '../../hooks/streaks/useStreakUrgency';
import { useStreakDebug } from '../../hooks/streaks/useStreakDebug';
import { getCurrentTier } from '../../lib/streakMilestones';

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
  showMilestoneTimeline?: boolean;
  streakOverride?: number;
  isDebugMode?: boolean;
}

function CustomStreaksTooltip({
  streak,
  children,
  shouldShowStreaks,
  setShouldShowStreaks,
  placement,
  showMilestoneTimeline,
  streakOverride,
  isDebugMode,
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
      content={
        <ReadingStreakPopup
          streak={streak}
          showMilestoneTimeline={showMilestoneTimeline}
          streakOverride={streakOverride}
        />
      }
      onClickOutside={
        isDebugMode ? undefined : () => setShouldShowStreaks(false)
      }
    >
      {children}
    </SimpleTooltip>
  );
}

const urgencyTooltipMessages: Partial<Record<UrgencyLevel, string>> = {
  [UrgencyLevel.Medium]: '1 post to keep your streak alive',
  [UrgencyLevel.High]: 'Less than 1 hour left!',
};

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
  const debug = useStreakDebug();
  const [shouldShowStreaks, setShouldShowStreaks] = useState(debug.isDebugMode);
  const hasReadToday =
    streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), user.timezone);
  const isTimezoneOk = useStreakTimezoneOk();
  const { animationState } = useStreakIncrement(streak?.current);
  const isStreaksEnabled = !!streak;
  const urgency = useStreakUrgency(
    !!hasReadToday,
    isStreaksEnabled,
    streak?.current,
  );

  const effectiveUrgency = debug.debugUrgency ?? urgency;
  const effectiveAnimation = debug.debugAnimationOverride ?? animationState;
  const effectiveStreak = debug.debugStreakOverride ?? streak?.current;
  const currentTier = getCurrentTier(effectiveStreak ?? 0);

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

  const urgencyMessage = debug.features.urgencyNudges
    ? urgencyTooltipMessages[effectiveUrgency]
    : undefined;
  const isIncrementing =
    debug.features.animatedCounter && effectiveAnimation === 'incrementing';
  const showUrgencyAnimation = debug.features.urgencyNudges;

  return (
    <>
      <ConditionalWrapper
        condition={!isMobile}
        wrapper={(children: ReactElement) => (
          <Tooltip
            content={urgencyMessage || `Current streak · ${currentTier.label}`}
            streak={streak}
            shouldShowStreaks={shouldShowStreaks}
            setShouldShowStreaks={setShouldShowStreaks}
            placement={!isMobile && !isLaptop ? 'bottom-start' : 'bottom-end'}
            showMilestoneTimeline={debug.features.milestoneTimeline}
            streakOverride={debug.debugStreakOverride ?? undefined}
            isDebugMode={debug.isDebugMode}
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
            <IconWrapper wrapperClassName="relative flex items-center gap-2">
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
            'gap-1',
            compact && 'text-accent-bacon-default',
            isIncrementing && 'animate-streak-bounce',
            showUrgencyAnimation &&
              effectiveUrgency === UrgencyLevel.Low &&
              'animate-streak-pulse',
            showUrgencyAnimation &&
              effectiveUrgency === UrgencyLevel.Medium &&
              'animate-streak-pulse',
            showUrgencyAnimation &&
              effectiveUrgency === UrgencyLevel.High &&
              'animate-streak-shake',
            className,
          )}
          size={!compact && !isMobile ? ButtonSize.Medium : ButtonSize.Small}
        >
          {debug.features.animatedCounter ? (
            <AnimatedNumber value={effectiveStreak ?? 0} />
          ) : (
            effectiveStreak
          )}
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
            <ReadingStreakPopup
              streak={streak}
              fullWidth
              showMilestoneTimeline={debug.features.milestoneTimeline}
              streakOverride={debug.debugStreakOverride ?? undefined}
            />
          </Drawer>
        </RootPortal>
      )}

      {debug.isDebugMode && (
        <div className="fixed bottom-4 right-4 z-max flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2">
          <span className="font-bold text-text-tertiary typo-footnote">
            Streak Debug
          </span>

          <div className="flex flex-col gap-1 border-b border-border-subtlest-tertiary pb-2">
            <span className="text-text-quaternary typo-caption1">Features</span>
            {(
              [
                ['animatedCounter', 'Animated Counter'],
                ['milestoneTimeline', 'Milestone Timeline'],
                ['urgencyNudges', 'Urgency Nudges'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => debug.toggleFeature(key)}
                className={classnames(
                  'rounded-8 px-3 py-1 text-left typo-footnote',
                  debug.features[key]
                    ? 'bg-accent-bacon-default text-white'
                    : 'bg-surface-float text-text-tertiary hover:bg-surface-hover',
                )}
              >
                {debug.features[key] ? '\u2713' : '\u2717'} {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={debug.triggerIncrementAnimation}
            className="rounded-8 bg-surface-float px-3 py-1 typo-footnote hover:bg-surface-hover"
          >
            Play +1 Animation
          </button>
          <button
            type="button"
            onClick={debug.cycleUrgency}
            className="rounded-8 bg-surface-float px-3 py-1 typo-footnote hover:bg-surface-hover"
          >
            Cycle Urgency ({effectiveUrgency})
          </button>
          <div className="flex gap-1">
            {[0, 3, 7, 14, 30, 90, 365].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => debug.setDebugStreak(d)}
                className={classnames(
                  'rounded-8 px-2 py-1 typo-caption1',
                  effectiveStreak === d
                    ? 'bg-accent-bacon-default text-white'
                    : 'bg-surface-float hover:bg-surface-hover',
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={debug.resetDebug}
            className="rounded-8 bg-surface-float px-3 py-1 text-text-tertiary typo-footnote hover:bg-surface-hover"
          >
            Reset
          </button>
        </div>
      )}
    </>
  );
}
