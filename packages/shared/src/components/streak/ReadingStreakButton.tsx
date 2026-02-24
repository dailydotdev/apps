import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
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
import { getCurrentTier, getMilestoneAtDay } from '../../lib/streakMilestones';
import { StreakIncrementPopover } from './StreakIncrementPopover';
import { StreakBrokenPopover } from './StreakBrokenPopover';
import { StreakMilestoneCelebration } from './StreakMilestoneCelebration';

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
          isVisible={shouldShowStreaks}
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
  const [debugPos, setDebugPos] = useState({ x: 16, y: 16 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [showMilestoneCelebration, setShowMilestoneCelebration] =
    useState(false);
  const hasReadToday =
    streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), user.timezone);
  const isTimezoneOk = useStreakTimezoneOk();
  const { animationState, previousStreak } = useStreakIncrement(streak?.current);
  const [showBrokenPopover, setShowBrokenPopover] = useState(false);
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
  const hitMilestone = getMilestoneAtDay(effectiveStreak ?? 0);

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
  const showIncrementAnimation =
    debug.features.animatedCounter && effectiveAnimation === 'incrementing';
  const showStreakBroken =
    showBrokenPopover || effectiveAnimation === 'broken';
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
        <div className="relative">
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
              isLaptop || isMobile
                ? ButtonVariant.Tertiary
                : ButtonVariant.Float
            }
            onClick={handleToggle}
            className={classnames(
              'gap-1 overflow-hidden border-solid',
              compact && 'text-accent-bacon-default',
              showIncrementAnimation && 'animate-streak-expand',
              !showIncrementAnimation &&
                showUrgencyAnimation &&
                effectiveUrgency === UrgencyLevel.Low &&
                'animate-streak-pulse',
              !showIncrementAnimation &&
                showUrgencyAnimation &&
                effectiveUrgency === UrgencyLevel.Medium &&
                'animate-streak-pulse',
              !showIncrementAnimation &&
                showUrgencyAnimation &&
                effectiveUrgency === UrgencyLevel.High &&
                'animate-streak-shake',
              className,
            )}
            size={!compact && !isMobile ? ButtonSize.Medium : ButtonSize.Small}
          >
            {showIncrementAnimation && (
              <span className="pointer-events-none absolute inset-0 z-1 animate-streak-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            )}
            {debug.features.animatedCounter ? (
              <AnimatedNumber value={effectiveStreak ?? 0} />
            ) : (
              effectiveStreak
            )}
            {!compact && ' reading days'}
          </Button>
          {showIncrementAnimation && !hitMilestone && (
            <StreakIncrementPopover
              fromStreak={Math.max((effectiveStreak ?? 1) - 1, 0)}
              toStreak={effectiveStreak ?? 1}
            />
          )}
          {showStreakBroken && (
            <StreakBrokenPopover
              previousStreak={previousStreak ?? effectiveStreak ?? 0}
            />
          )}
        </div>
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
              isVisible={shouldShowStreaks}
            />
          </Drawer>
        </RootPortal>
      )}

      {((showIncrementAnimation && hitMilestone) ||
        showMilestoneCelebration) && (
        <StreakMilestoneCelebration
          milestone={
            hitMilestone ?? getCurrentTier(effectiveStreak ?? 0)
          }
          streakDay={effectiveStreak ?? 0}
          onComplete={() => setShowMilestoneCelebration(false)}
        />
      )}

      {debug.isDebugMode && (
        <div
          className="fixed z-max flex w-fit flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2"
          style={{ left: debugPos.x, bottom: debugPos.y }}
        >
          <span
            className="cursor-grab font-bold text-text-tertiary typo-footnote select-none active:cursor-grabbing"
            onMouseDown={(e) => {
              dragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                origX: debugPos.x,
                origY: debugPos.y,
              };

              const onMove = (ev: MouseEvent) => {
                if (!dragRef.current) {
                  return;
                }

                setDebugPos({
                  x: dragRef.current.origX + (ev.clientX - dragRef.current.startX),
                  y: dragRef.current.origY - (ev.clientY - dragRef.current.startY),
                });
              };

              const onUp = () => {
                dragRef.current = null;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
              };

              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}
          >
            ⠿ Streak Debug
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
            onClick={() => setShowMilestoneCelebration(true)}
            className="rounded-8 bg-surface-float px-3 py-1 typo-footnote hover:bg-surface-hover"
          >
            Play Milestone 🎉
          </button>
          <button
            type="button"
            onClick={() => setShowBrokenPopover((v) => !v)}
            className="rounded-8 bg-surface-float px-3 py-1 typo-footnote hover:bg-surface-hover"
          >
            Play Streak Broken 💔
          </button>
          <div className="flex gap-1">
            {[0, 3, 7, 14, 30, 90, 365, 730, 1095, 1460].map((d) => (
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
