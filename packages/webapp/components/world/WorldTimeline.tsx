import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { WorldState } from './worldState';
import { worldCounts } from './worldState';

const SPEEDS = [1, 4, 16];

/* The transport glyphs are text rather than icons, so the button has to be
   squared off by hand — the icon-only sizing never kicks in for a label. */
const Transport = ({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Tooltip content={label}>
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={active ? ButtonVariant.Primary : ButtonVariant.Float}
      disabled={disabled}
      onClick={onClick}
      className="w-8 flex-none !px-0"
    >
      {children}
    </Button>
  </Tooltip>
);

interface WorldTimelineProps {
  state: WorldState;
  /* The history has not landed yet. The bar is here anyway, holding its place
     over the world so it does not shove the layout when it comes alive. */
  pending?: boolean;
  /* A callback ref, not an object one: the canvas only exists once the world
     is replayable, which is well after the engine was created, so the engine
     has to be told about it at the moment it mounts. */
  sparkRef: (canvas: HTMLCanvasElement | null) => void;
  onToggle: () => void;
  onSeek: (day: number) => void;
  onStart: () => void;
  onEnd: () => void;
  onSpeed: (speed: number) => void;
}

/**
 * The growth log, replayed. Districts are founded, land rises and levels tick
 * over as it runs — and because the log is append-only and the layout is
 * absolute, it can only ever ADD. Nothing moves and nothing shrinks.
 *
 * The sparkline is a canvas the engine paints: one bar per day, coloured by the
 * realm that owned it, so the scrubber shows where the interesting parts are.
 */
export function WorldTimeline({
  state,
  pending,
  sparkRef,
  onToggle,
  onSeek,
  onStart,
  onEnd,
  onSpeed,
}: WorldTimelineProps): ReactElement {
  const max = Math.max(1, (state.totalDays ?? 1) - 1);
  /* Pinned to today while the log is on the wire, which is where the world it
     is sitting over is standing — a marker parked at the left edge would read
     as a replay rewound to the beginning. */
  const at = pending ? 1 : Math.min(state.day ?? 0, max) / max;

  return (
    <div
      data-world-overlay
      className="pointer-events-auto absolute bottom-3 left-3 right-3 z-1 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 laptop:left-[21rem]"
    >
      <div className="flex items-center gap-2 laptop:gap-3">
        <Transport
          label="Rewind to the first day"
          disabled={pending}
          onClick={onStart}
        >
          ⏮
        </Transport>
        <Transport
          label="Replay"
          active={state.playing}
          disabled={pending}
          onClick={onToggle}
        >
          {state.playing ? '❚❚' : '▶'}
        </Transport>
        <Transport label="Jump to today" disabled={pending} onClick={onEnd}>
          ⏭
        </Transport>
        <div className="flex min-w-0 flex-col">
          <Typography
            type={TypographyType.Footnote}
            bold
            className="tabular-nums"
          >
            {state.date ?? '—'}
          </Typography>
          {/* Below laptop this line is already the whole of the header bar, and
              repeating it here is what pushed the speed buttons off the edge. */}
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="hidden laptop:block"
            truncate
          >
            {state.open
              ? `${state.open.name} · ${worldCounts(state)}`
              : worldCounts(state)}
          </Typography>
        </div>
        <ButtonGroup className="ml-auto flex-none">
          {SPEEDS.map((speed) => (
            <Button
              type="button"
              key={speed}
              size={ButtonSize.XSmall}
              disabled={pending}
              variant={
                state.speed === speed
                  ? ButtonVariant.Float
                  : ButtonVariant.Tertiary
              }
              className={state.speed === speed ? 'text-text-primary' : ''}
              onClick={() => onSpeed(speed)}
            >
              {speed}×
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className="relative mt-3 h-8">
        <canvas
          ref={sparkRef}
          className="absolute inset-0 h-8 w-full rounded-10 bg-surface-float"
        />
        <input
          type="range"
          aria-label="Day"
          min={0}
          max={max}
          step={1}
          disabled={pending}
          value={pending ? max : Math.min(state.day ?? 0, max)}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="absolute inset-0 m-0 h-8 w-full cursor-pointer opacity-0 disabled:cursor-default"
        />
        <div
          className="pointer-events-none absolute -bottom-0.5 -top-0.5 w-0.5 rounded-2 bg-text-primary"
          style={{ left: `${at * 100}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {state.from ?? '—'}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {state.to ?? '—'}
        </Typography>
      </div>
    </div>
  );
}
