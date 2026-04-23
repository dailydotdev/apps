import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import {
  FOCUS_SESSION_PRESETS_MIN,
  useFocusSession,
  useFocusSettings,
  useFocusTick,
  isSessionActive,
  isSessionPaused,
  getRemainingMs,
} from '../store/focusSession.store';
import { useFocusHistory } from '../store/focusHistory.store';
import { FocusEscapePrompt } from './FocusEscapePrompt';
import { FocusRecap } from './FocusRecap';

const padTwo = (n: number): string => n.toString().padStart(2, '0');

const formatRemaining = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1_000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${padTwo(minutes)}:${padTwo(seconds)}`;
  }
  return `${padTwo(minutes)}:${padTwo(seconds)}`;
};

const formatShort = (ms: number): string => {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  if (totalMinutes >= 60) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m === 0 ? `${h} hour${h === 1 ? '' : 's'}` : `${h}h ${m}m`;
  }
  return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`;
};

interface PresetPickerProps {
  onStart: (minutes: number) => void;
}

const PresetPicker = ({ onStart }: PresetPickerProps): ReactElement => {
  const { settings } = useFocusSettings();
  const [selected, setSelected] = useState<number>(
    settings.defaultDurationMinutes,
  );

  const presets = useMemo(() => {
    const base = new Set<number>([
      ...FOCUS_SESSION_PRESETS_MIN,
      settings.defaultDurationMinutes,
    ]);
    return Array.from(base).sort((a, b) => a - b);
  }, [settings.defaultDurationMinutes]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.LargeTitle}
        bold
        className="text-center"
      >
        Ready to focus?
      </Typography>
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Tertiary}
        className="text-balance text-center"
      >
        Pick a length. Your feed stays out of the way until you&apos;re done.
      </Typography>
      <div
        role="radiogroup"
        aria-label="Session length"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {presets.map((minutes) => {
          const isSelected = minutes === selected;
          return (
            <button
              key={minutes}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(minutes)}
              className={classNames(
                'rounded-12 border px-4 py-2 transition-colors typo-callout',
                isSelected
                  ? 'border-accent-cabbage-default bg-surface-float text-text-primary'
                  : 'border-border-subtlest-tertiary text-text-tertiary hover:bg-surface-float hover:text-text-primary',
              )}
            >
              {minutes} min
            </button>
          );
        })}
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        onClick={() => onStart(selected)}
      >
        Start {selected}-min session
      </Button>
    </div>
  );
};

interface CountdownProps {
  onPause: () => void;
  onResume: () => void;
  onEndRequest: () => void;
}

const Countdown = ({
  onPause,
  onResume,
  onEndRequest,
}: CountdownProps): ReactElement => {
  const { session } = useFocusSession();
  const remainingMs = useFocusTick(session);
  const paused = isSessionPaused(session);
  const label = formatRemaining(remainingMs);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <Typography
        type={TypographyType.Subhead}
        color={TypographyColor.Tertiary}
      >
        Focusing on one thing
      </Typography>
      <time
        dateTime={`PT${Math.ceil(remainingMs / 1_000)}S`}
        aria-live="polite"
        aria-atomic="true"
        className="block text-center text-[6rem] font-bold tabular-nums leading-none tracking-tight text-text-primary tablet:text-[8rem]"
      >
        {label}
      </time>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Medium}
          onClick={paused ? onResume : onPause}
        >
          {paused ? 'Resume' : 'Pause'}
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          onClick={onEndRequest}
        >
          End session
        </Button>
      </div>
    </div>
  );
};

// The full-bleed container that replaces the feed while a user is in Focus
// mode. Owns three states: pre-session picker, running countdown, and a
// completion recap. The escape prompt is rendered as a separate dialog
// layered on top of the countdown when the user tries to bail early.
export const FocusSession = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { session, start, pause, resume, end, complete } = useFocusSession();
  const { settings } = useFocusSettings();
  const { record } = useFocusHistory();
  const [isEscapeOpen, setEscapeOpen] = useState(false);

  const active = isSessionActive(session);
  const completed = session.completedAt !== null;
  const remainingMs = active ? getRemainingMs(session) : 0;

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    if (remainingMs === 0) {
      complete();
      return undefined;
    }
    const id = window.setTimeout(() => {
      complete();
    }, remainingMs);
    return () => window.clearTimeout(id);
    // We deliberately key on startedAt/pausedAt so the timer restarts cleanly
    // after pause/resume transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.startedAt, session.pausedAt, active]);

  // When a session lands in the completed state, append it to the local
  // history exactly once. We key off `completedAt` so pause/resume loops
  // never double-record.
  useEffect(() => {
    if (session.completedAt === null) {
      return;
    }
    record({
      completedAt: session.completedAt,
      durationMinutes: session.durationMinutes,
    });
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_complete',
      extra: JSON.stringify({ minutes: session.durationMinutes }),
    });
    // Record is stable; logEvent is referentially stable enough; we only want
    // to fire on a new completedAt value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.completedAt]);

  const handleStart = (minutes: number) => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_start',
      extra: JSON.stringify({ minutes }),
    });
    start(minutes);
  };

  const handlePause = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_pause',
    });
    pause();
  };

  const handleResume = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_resume',
    });
    resume();
  };

  const handleEndRequest = () => {
    if (settings.escapeFriction && remainingMs > 0) {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'focus_escape_prompt',
      });
      setEscapeOpen(true);
      return;
    }
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_end',
    });
    end();
  };

  const handleConfirmEnd = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_escape_confirm',
    });
    setEscapeOpen(false);
    end();
  };

  const handleDismissRecap = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_recap_done',
    });
    end();
  };

  if (completed) {
    return (
      <FocusRecap
        durationMinutes={session.durationMinutes}
        onDismiss={handleDismissRecap}
      />
    );
  }

  return (
    <section
      aria-label="Focus session"
      className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-10 px-4 pb-16 pt-16 tablet:pt-24"
    >
      {active ? (
        <Countdown
          onPause={handlePause}
          onResume={handleResume}
          onEndRequest={handleEndRequest}
        />
      ) : (
        <PresetPicker onStart={handleStart} />
      )}
      <FocusEscapePrompt
        isOpen={isEscapeOpen}
        remainingLabel={formatShort(remainingMs)}
        onCancel={() => setEscapeOpen(false)}
        onConfirm={handleConfirmEnd}
      />
    </section>
  );
};
