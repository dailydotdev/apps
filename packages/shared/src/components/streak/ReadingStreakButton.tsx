import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Drawer, DrawerPosition } from '../drawers';
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
import { StreakReminderPopover } from './StreakReminderPopover';
import { StreakMilestoneCelebration } from './StreakMilestoneCelebration';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { Switch } from '../fields/Switch';

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
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = useViewSize(ViewSize.MobileL);
  const isTablet = useViewSize(ViewSize.Tablet);
  const debug = useStreakDebug();
  const [shouldShowStreaks, setShouldShowStreaks] = useState(false);
  const [showStreakAsDrawer, setShowStreakAsDrawer] = useState(false);
  const [debugPos, setDebugPos] = useState({ x: 16, y: 16 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [showMilestoneCelebration, setShowMilestoneCelebration] =
    useState(false);
  const effectiveStreak = debug.isDebugMode
    ? debug.debugStreakOverride ?? 0
    : streak?.current;
  const isDebugStreakInactive = debug.isDebugMode && effectiveStreak === 0;
  const hasReadToday =
    !isDebugStreakInactive &&
    !!streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), user.timezone);
  const isTimezoneOk = useStreakTimezoneOk();
  const { animationState, previousStreak } = useStreakIncrement(
    streak?.current,
  );
  const [showBrokenPopover, setShowBrokenPopover] = useState(false);
  const [showReminderPopover, setShowReminderPopover] = useState(false);
  const isStreaksEnabled = !!streak && !isDebugStreakInactive;
  const urgency = useStreakUrgency(
    !!hasReadToday,
    isStreaksEnabled,
    effectiveStreak ?? undefined,
  );

  const effectiveUrgency = debug.debugUrgency ?? urgency;
  const effectiveAnimation = debug.debugAnimationOverride ?? animationState;
  const currentTier = getCurrentTier(effectiveStreak ?? 0);
  const hitMilestone = getMilestoneAtDay(effectiveStreak ?? 0);
  const decrementDebugStreak = useCallback(() => {
    debug.setDebugStreak(Math.max((effectiveStreak ?? 0) - 1, 0));
  }, [debug, effectiveStreak]);
  const incrementDebugStreak = useCallback(() => {
    debug.setDebugStreak((effectiveStreak ?? 0) + 1);
  }, [debug, effectiveStreak]);

  const handleToggle = useCallback(() => {
    setShouldShowStreaks((state) => !state);

    if (!shouldShowStreaks) {
      logEvent({
        event_name: LogEvent.OpenStreaks,
      });
    }
  }, [shouldShowStreaks, logEvent]);
  const handleCloseDrawer = useCallback(() => {
    setShouldShowStreaks(false);
  }, []);

  const Tooltip = shouldShowStreaks ? CustomStreaksTooltip : SimpleTooltip;

  useEffect(() => {
    if (isTesting || isLoading || !streak || !user?.id || hasReadToday) {
      return;
    }

    const sessionKey = `streak-reminder-shown:${user.id}`;

    try {
      if (sessionStorage.getItem(sessionKey)) {
        return;
      }

      sessionStorage.setItem(sessionKey, '1');
    } catch {
      // Fallback for environments where sessionStorage is unavailable.
    }

    requestAnimationFrame(() => setShowReminderPopover(true));
  }, [hasReadToday, isLoading, streak, user?.id]);

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
  const isDebugIncrement = debug.debugAnimationOverride === 'incrementing';
  const showStreakBroken = showBrokenPopover || effectiveAnimation === 'broken';
  const showUrgencyAnimation = debug.features.urgencyNudges;
  const isTabletOnly = isTablet && !isLaptop;
  const shouldOpenInDrawer =
    isMobile || isTabletOnly || (debug.isDebugMode && showStreakAsDrawer);

  return (
    <>
      <ConditionalWrapper
        condition={!shouldOpenInDrawer}
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
              <span className="via-white/30 pointer-events-none absolute inset-0 z-1 animate-streak-shine bg-gradient-to-r from-transparent to-transparent" />
            )}
            {debug.features.animatedCounter ? (
              <AnimatedNumber value={effectiveStreak ?? 0} />
            ) : (
              effectiveStreak
            )}
            {!compact && ' reading days'}
          </Button>
          {showIncrementAnimation && (isDebugIncrement || !hitMilestone) && (
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
          {showReminderPopover && (
            <StreakReminderPopover currentStreak={effectiveStreak ?? 0} />
          )}
        </div>
      </ConditionalWrapper>

      {shouldOpenInDrawer && (
        <RootPortal>
          <Drawer
            isOpen={shouldShowStreaks}
            onClose={handleToggle}
            position={isMobile ? DrawerPosition.Bottom : DrawerPosition.Right}
            className={
              isMobile
                ? undefined
                : {
                    wrapper:
                      'h-full !max-h-full !w-[320px] max-w-[calc(100vw-2rem)] border-l border-border-subtlest-tertiary',
                  }
            }
          >
            <ReadingStreakPopup
              streak={streak}
              fullWidth
              showMilestoneTimeline={debug.features.milestoneTimeline}
              streakOverride={debug.debugStreakOverride ?? undefined}
              isVisible={shouldShowStreaks}
              onClose={handleCloseDrawer}
            />
          </Drawer>
        </RootPortal>
      )}

      {((showIncrementAnimation && hitMilestone && !isDebugIncrement) ||
        showMilestoneCelebration) && (
        <StreakMilestoneCelebration
          milestone={hitMilestone ?? getCurrentTier(effectiveStreak ?? 0)}
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
            className="cursor-grab select-none font-bold text-text-tertiary typo-footnote active:cursor-grabbing"
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
                  x:
                    dragRef.current.origX +
                    (ev.clientX - dragRef.current.startX),
                  y:
                    dragRef.current.origY -
                    (ev.clientY - dragRef.current.startY),
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
            onClick={() => {
              setShowBrokenPopover(false);
              if (!user) {
                requestAnimationFrame(() => setShowBrokenPopover(true));
                return;
              }

              openModal({
                type: LazyModal.RecoverStreak,
                props: { user, forceOpen: true },
              });
            }}
            className="rounded-8 bg-surface-float px-3 py-1 typo-footnote hover:bg-surface-hover"
          >
            Play Streak Broken 💔
          </button>
          <button
            type="button"
            onClick={() => {
              setShowReminderPopover(false);
              requestAnimationFrame(() => setShowReminderPopover(true));
            }}
            className="rounded-8 bg-surface-float px-3 py-1 typo-footnote hover:bg-surface-hover"
          >
            Play Reminder 🔔
          </button>
          <Switch
            inputId="streak-debug-drawer-mode"
            name="streak-debug-drawer-mode"
            checked={showStreakAsDrawer}
            onToggle={() => setShowStreakAsDrawer((value) => !value)}
            className="rounded-8 bg-surface-float px-3 py-2 hover:bg-surface-hover"
          >
            Open as right drawer
          </Switch>
          <Switch
            inputId="streak-debug-feed-hero"
            name="streak-debug-feed-hero"
            checked={debug.isFeedHeroVisible}
            onToggle={() => debug.setFeedHeroVisible(!debug.isFeedHeroVisible)}
            className="rounded-8 bg-surface-float px-3 py-2 hover:bg-surface-hover"
          >
            Show feed hero night
          </Switch>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={decrementDebugStreak}
              className="rounded-8 bg-surface-float px-3 py-1 typo-footnote hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
              disabled={(effectiveStreak ?? 0) <= 0}
              aria-label="Decrease debug streak by one day"
            >
              -
            </button>
            <span className="min-w-10 text-center text-text-tertiary typo-footnote">
              {effectiveStreak ?? 0}
            </span>
            <button
              type="button"
              onClick={incrementDebugStreak}
              className="rounded-8 bg-surface-float px-3 py-1 typo-footnote hover:bg-surface-hover"
              aria-label="Increase debug streak by one day"
            >
              +
            </button>
          </div>
          <div className="flex gap-1">
            {[0, 3, 4, 7, 14, 30, 90, 365, 730, 1095, 1460].map((d) => (
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
