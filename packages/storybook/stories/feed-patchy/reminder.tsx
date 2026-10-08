import type {
  KeyboardEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
} from 'react';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import classNames from 'classnames';

// The reading-reminder ask, rebuilt for the moment after Patchy is fed. One
// card instead of four bordered radio rows: a big readout, an hour ruler you
// scrub with a thumb, and three presets as a segmented control. Whole hours
// only, because that is what `subscribePersonalizedDigest` stores.

/** Width of one hour on the ruler. */
const SLOT = 32;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** The production step's three presets, same hours. */
const presets = [
  { label: 'Morning', hour: 9 },
  { label: 'Lunch', hour: 12 },
  { label: 'Evening', hour: 17 },
];

export const formatHour = (hour: number): string =>
  `${String(hour).padStart(2, '0')}:00`;

const momentOf = (hour: number): string => {
  if (hour >= 5 && hour < 11) {
    return 'Morning, with your coffee';
  }
  if (hour >= 11 && hour < 14) {
    return 'Over your lunch break';
  }
  if (hour >= 14 && hour < 17) {
    return 'The afternoon lull';
  }
  if (hour >= 17 && hour < 21) {
    return 'Evening, winding down';
  }
  return 'Late-night reading';
};

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const zoneLabel = timeZone.split('/').pop()?.replace(/_/g, ' ') ?? timeZone;

const clamp = (hour: number) => Math.min(23, Math.max(0, hour));

// Edges fade out, so the ruler reads as continuing past the card.
const rulerMask =
  'linear-gradient(90deg, transparent, black 22%, black 78%, transparent)';

export const ReminderPicker = ({
  hour,
  onChange,
  isCompact = false,
}: {
  hour: number;
  onChange: (hour: number) => void;
  /** Short screens: no header row, a smaller readout, tighter spacing. */
  isCompact?: boolean;
}): ReactElement => {
  const ruler = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const isClickSuppressed = useRef(false);
  // The hour a preset, tap or key is gliding to. Set, the readout jumps
  // straight to it instead of counting through every hour on the way, and
  // repeated keys build on it rather than on a value still catching up.
  const target = useRef<number | null>(null);
  const targetTimeout = useRef<number>();

  // Mount on the starting hour before paint. After that the ruler leads and
  // the hour follows it.
  useLayoutEffect(() => {
    if (ruler.current) {
      ruler.current.scrollLeft = hour * SLOT;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const releaseTarget = () => {
    target.current = null;
    window.clearTimeout(targetTimeout.current);
  };

  const goTo = (next: number) => {
    const element = ruler.current;
    if (!element) {
      return;
    }
    const hourTo = clamp(next);
    if (hourTo !== hour) {
      onChange(hourTo);
    }
    if (Math.round(element.scrollLeft / SLOT) !== hourTo) {
      target.current = hourTo;
      // Smooth scrolling has no end event everywhere; let go after a beat
      // so a scroll that never arrives cannot pin the readout.
      window.clearTimeout(targetTimeout.current);
      targetTimeout.current = window.setTimeout(releaseTarget, 900);
    }
    element.scrollTo({ left: hourTo * SLOT, behavior: 'smooth' });
  };

  useEffect(() => () => window.clearTimeout(targetTimeout.current), []);

  const hourAt = (clientX: number) => {
    const element = ruler.current;
    if (!element) {
      return hour;
    }
    const rect = element.getBoundingClientRect();
    const fromCentre = clientX - (rect.left + rect.width / 2);
    return clamp(Math.round((element.scrollLeft + fromCentre) / SLOT));
  };

  const onScroll = () => {
    const element = ruler.current;
    if (!element) {
      return;
    }
    const next = clamp(Math.round(element.scrollLeft / SLOT));
    if (target.current !== null) {
      if (next === target.current) {
        releaseTarget();
      }
      return;
    }
    if (next !== hour) {
      onChange(next);
    }
  };

  // Touch scrolls natively. A mouse has no swipe, so it drags the ruler, with
  // snapping off mid-drag and a smooth settle on release.
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = ruler.current;
    // A finger or the mouse takes over from any glide in progress.
    releaseTarget();
    if (event.pointerType !== 'mouse' || !element) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, left: element.scrollLeft };
    element.style.scrollSnapType = 'none';
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || !ruler.current) {
      return;
    }
    ruler.current.scrollLeft =
      drag.current.left - (event.clientX - drag.current.x);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = ruler.current;
    if (!drag.current || !element) {
      return;
    }
    const hasMoved = Math.abs(event.clientX - drag.current.x) > 4;
    drag.current = null;
    element.style.scrollSnapType = '';
    if (hasMoved) {
      isClickSuppressed.current = true;
      goTo(Math.round(element.scrollLeft / SLOT));
    }
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isClickSuppressed.current) {
      isClickSuppressed.current = false;
      return;
    }
    goTo(hourAt(event.clientX));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = target.current ?? hour;
    const next = {
      ArrowLeft: from - 1,
      ArrowDown: from - 1,
      ArrowRight: from + 1,
      ArrowUp: from + 1,
      Home: 0,
      End: 23,
    }[event.key];
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    goTo(next);
  };

  return (
    <div
      className={classNames(
        'flex w-full flex-col rounded-24 border border-border-subtlest-tertiary bg-surface-float',
        isCompact ? 'gap-3 px-4 py-3' : 'gap-5 px-5 pb-5 pt-4',
      )}
    >
      {!isCompact && (
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-[0.12em] text-text-tertiary typo-caption1">
            Daily reminder
          </span>
          <span className="text-text-tertiary typo-footnote">
            {zoneLabel} time
          </span>
        </div>
      )}

      {/* No live region: the slider already announces its value. */}
      <div className="flex flex-col items-center gap-1">
        <span className="overflow-hidden">
          <span
            key={hour}
            className={classNames(
              'cs-digit font-bold tabular-nums text-text-primary',
              isCompact ? 'typo-large-title' : 'typo-mega2',
            )}
          >
            {formatHour(hour)}
          </span>
        </span>
        <span className="text-center text-text-secondary typo-subhead">
          {momentOf(hour)}
          {isCompact && ` · ${zoneLabel} time`}
        </span>
      </div>

      <div className="relative">
        {/* The needle: where the ruler reads from. */}
        <span
          aria-hidden
          className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-accent-cheese-default"
        />
        <div
          ref={ruler}
          role="slider"
          tabIndex={0}
          aria-label="Reminder time"
          aria-valuemin={0}
          aria-valuemax={23}
          aria-valuenow={hour}
          aria-valuetext={formatHour(hour)}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={onClick}
          onKeyDown={onKeyDown}
          className="flex cursor-grab snap-x snap-mandatory overflow-x-auto rounded-8 pt-3 [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-cabbage-default active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          style={{ maskImage: rulerMask, WebkitMaskImage: rulerMask }}
        >
          <span
            aria-hidden
            className="shrink-0"
            style={{ width: `calc(50% - ${SLOT / 2}px)` }}
          />
          {HOURS.map((tick) => {
            const isMajor = tick % 3 === 0;
            const isCurrent = tick === hour;

            return (
              <span
                key={tick}
                aria-hidden
                className="flex shrink-0 snap-center flex-col items-center gap-2"
                style={{ width: SLOT }}
              >
                <span
                  className={classNames(
                    'w-0.5 rounded-full transition-[height,background-color] duration-150',
                    isCurrent && 'h-6 bg-accent-cheese-default',
                    !isCurrent && isMajor && 'h-4 bg-text-tertiary',
                    !isCurrent && !isMajor && 'h-2.5 bg-text-quaternary',
                  )}
                />
                <span
                  className={classNames(
                    'tabular-nums transition-colors',
                    !isMajor && !isCurrent && 'invisible',
                    isCurrent
                      ? 'font-bold text-text-primary typo-footnote'
                      : 'text-text-tertiary typo-caption1',
                  )}
                >
                  {String(tick).padStart(2, '0')}
                </span>
              </span>
            );
          })}
          <span
            aria-hidden
            className="shrink-0"
            style={{ width: `calc(50% - ${SLOT / 2}px)` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-14 bg-background-default p-1">
        {presets.map((preset) => {
          const isActive = preset.hour === hour;

          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => goTo(preset.hour)}
              className={classNames(
                'cs-press flex flex-col items-center gap-0.5 rounded-10 py-2 transition-colors duration-200',
                isActive
                  ? 'bg-surface-float text-text-primary shadow-2'
                  : 'text-text-tertiary hover:text-text-secondary',
              )}
            >
              <span className="font-bold typo-callout">{preset.label}</span>
              <span className="tabular-nums typo-footnote">
                {formatHour(preset.hour)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
