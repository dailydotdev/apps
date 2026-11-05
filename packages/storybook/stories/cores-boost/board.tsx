import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { MedalIcon } from '@dailydotdev/shared/src/components/icons/Medal';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { CreditCardIcon } from '@dailydotdev/shared/src/components/icons/CreditCard';
import { WarningIcon } from '@dailydotdev/shared/src/components/icons/Warning';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { MinusIcon } from '@dailydotdev/shared/src/components/icons/Minus';

// A Miro-style board: an infinite dotted canvas you pan by dragging (or with
// the wheel) and zoom with pinch / ctrl + wheel. Frames hold lanes of steps,
// and stickies hang under the step they talk about.

export type Surface =
  | 'Page'
  | 'Modal'
  | 'Sheet'
  | 'Notification'
  | 'Toast'
  | 'Menu'
  | 'Checkout'
  | 'Email'
  | 'System'
  | 'Widget';

export type StepStatus =
  | 'same'
  | 'changed'
  | 'new'
  | 'broken'
  | 'deadend'
  | 'removed';

export type NoteTone = 'pain' | 'fix' | 'data' | 'voice' | 'backend';

export interface Note {
  tone: NoteTone;
  text: ReactNode;
}

export interface Step {
  surface: Surface;
  title: string;
  // Mini screen lines. "[Label]" draws a primary button, "(Label)" a
  // secondary one, "# Text" a heading, "~" a skeleton line, "! Text" an
  // error line, anything else plain text.
  ui?: string[];
  where?: string;
  status?: StepStatus;
  via?: string;
  notes?: Note[];
}

const surfaceIcon: Record<Surface, ReactElement> = {
  Page: <span className="size-2 rounded-2 bg-text-tertiary" />,
  Modal: <span className="size-2 rounded-full bg-text-tertiary" />,
  Sheet: <span className="h-1 w-3 rounded-full bg-text-tertiary" />,
  Notification: <BellIcon size={IconSize.Size16} />,
  Toast: <span className="h-1.5 w-3 rounded-4 bg-text-tertiary" />,
  Menu: <span className="h-2.5 w-2 rounded-2 border border-text-tertiary" />,
  Checkout: <CreditCardIcon size={IconSize.Size16} />,
  Email: <span className="h-2 w-3 rounded-2 border border-text-tertiary" />,
  System: <SparkleIcon size={IconSize.Size16} />,
  Widget: <span className="size-2 rounded-4 border border-text-tertiary" />,
};

const statusBadge: Record<
  StepStatus,
  { label: string; className: string } | null
> = {
  same: null,
  changed: {
    label: 'Changed',
    className: 'bg-accent-cabbage-flat text-accent-cabbage-default',
  },
  new: {
    label: 'New',
    className: 'bg-accent-avocado-flat text-accent-avocado-default',
  },
  broken: {
    label: 'Broken',
    className: 'bg-accent-ketchup-flat text-accent-ketchup-default',
  },
  deadend: {
    label: 'Dead end',
    className: 'bg-accent-ketchup-flat text-accent-ketchup-default',
  },
  removed: {
    label: 'Removed',
    className: 'bg-surface-float text-text-tertiary',
  },
};

const statusBorder: Partial<Record<StepStatus, string>> = {
  changed: 'border-accent-cabbage-default',
  new: 'border-accent-avocado-default',
  broken: 'border-accent-ketchup-default',
  deadend: 'border-accent-ketchup-default border-dashed',
  removed: 'border-border-subtlest-tertiary border-dashed opacity-60',
};

const noteStyle: Record<
  NoteTone,
  { label: string; className: string; labelClassName: string }
> = {
  pain: {
    label: 'Pain point',
    className: 'bg-accent-ketchup-flat',
    labelClassName: 'text-accent-ketchup-default',
  },
  fix: {
    label: 'Fix',
    className: 'bg-accent-avocado-flat',
    labelClassName: 'text-accent-avocado-default',
  },
  data: {
    label: 'Data',
    className: 'bg-accent-water-flat',
    labelClassName: 'text-accent-water-default',
  },
  voice: {
    label: 'Users said',
    className: 'bg-accent-cheese-flat',
    labelClassName: 'text-accent-cheese-default',
  },
  backend: {
    label: 'Needs backend',
    className: 'bg-accent-onion-flat',
    labelClassName: 'text-accent-onion-default',
  },
};

const tilts = ['-rotate-1', 'rotate-1', 'rotate-0', '-rotate-1', 'rotate-1'];

export const Sticky = ({
  tone,
  children,
  index = 0,
  className,
}: {
  tone: NoteTone;
  children: ReactNode;
  index?: number;
  className?: string;
}): ReactElement => {
  const style = noteStyle[tone];
  return (
    <div
      className={classNames(
        'flex flex-col gap-1 rounded-4 p-3 text-text-primary shadow-2 typo-footnote',
        style.className,
        tilts[index % tilts.length],
        className,
      )}
    >
      <span
        className={classNames(
          'font-bold uppercase typo-caption2',
          style.labelClassName,
        )}
      >
        {style.label}
      </span>
      <div>{children}</div>
    </div>
  );
};

const UiLine = ({ line }: { line: string }): ReactElement => {
  if (line === '~') {
    return <span className="h-2 w-3/4 rounded-4 bg-border-subtlest-tertiary" />;
  }
  const parts = line
    .split(/(\[[^\]]+\]|\([^)]+\))/)
    .filter((part) => part.trim());
  if (parts.some((part) => /^[[(]/.test(part) && /[\])]$/.test(part))) {
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        {parts.map((part, index) => {
          const key = `${part}-${index}`;
          if (part.startsWith('[') && part.endsWith(']')) {
            return (
              <span
                key={key}
                className="rounded-8 bg-text-primary px-2 py-1 font-bold text-surface-invert typo-caption1"
              >
                {part.slice(1, -1)}
              </span>
            );
          }
          if (part.startsWith('(') && part.endsWith(')')) {
            return (
              <span
                key={key}
                className="rounded-8 border border-border-subtlest-secondary px-2 py-1 font-bold typo-caption1"
              >
                {part.slice(1, -1)}
              </span>
            );
          }
          return (
            <span key={key} className="text-text-secondary typo-caption1">
              {part.trim()}
            </span>
          );
        })}
      </span>
    );
  }
  if (line.startsWith('# ')) {
    return <span className="font-bold typo-footnote">{line.slice(2)}</span>;
  }
  if (line.startsWith('! ')) {
    return (
      <span className="text-accent-ketchup-default typo-caption1">
        {line.slice(2)}
      </span>
    );
  }
  return <span className="text-text-secondary typo-caption1">{line}</span>;
};

export const STEP_WIDTH = 'w-60';

export const StepCard = ({ step }: { step: Step }): ReactElement => {
  const badge = statusBadge[step.status ?? 'same'];
  return (
    <div
      className={classNames(
        'flex flex-col gap-2 rounded-16 border bg-background-default p-3 shadow-2',
        STEP_WIDTH,
        statusBorder[step.status ?? 'same'] ??
          'border-border-subtlest-tertiary',
      )}
    >
      <div className="flex items-center gap-1.5 text-text-tertiary typo-caption2">
        <span className="flex size-4 items-center justify-center">
          {surfaceIcon[step.surface]}
        </span>
        <span className="font-bold uppercase">{step.surface}</span>
        {badge && (
          <span
            className={classNames(
              'ml-auto rounded-6 px-1.5 py-0.5 font-bold typo-caption2',
              badge.className,
            )}
          >
            {badge.label}
          </span>
        )}
      </div>
      <span className="font-bold typo-callout">{step.title}</span>
      {step.ui && (
        <div className="flex flex-col gap-1.5 rounded-10 bg-surface-float p-2">
          {step.ui.map((line, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <UiLine key={index} line={line} />
          ))}
        </div>
      )}
      {step.where && (
        <span className="break-all font-mono text-text-quaternary typo-caption2">
          {step.where}
        </span>
      )}
    </div>
  );
};

const Connector = ({ label }: { label?: string }): ReactElement => (
  <div className="relative mt-14 flex w-24 shrink-0 flex-col items-center">
    {label && (
      <span className="absolute bottom-2 left-1 right-2 text-center leading-tight text-text-tertiary typo-caption2">
        {label}
      </span>
    )}
    <div className="relative h-px w-full bg-text-quaternary">
      <span className="absolute -right-0.5 -top-1 size-0 border-y-4 border-l-[0.375rem] border-y-transparent border-l-text-quaternary" />
    </div>
  </div>
);

// Steps are a fixed 15rem wide and connectors 6rem, so a branch lane can
// start right under the step it leaves from.
const branchOffsetRem = (from: number): number => from * (15 + 6);

export const Lane = ({
  label,
  tone = 'today',
  steps,
  from,
}: {
  label: string;
  tone?: 'today' | 'fixed' | 'branch';
  steps: Step[];
  from?: number;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <span
      className={classNames(
        'self-start rounded-8 px-2 py-1 font-bold typo-footnote',
        tone === 'today' &&
          'bg-accent-ketchup-flat text-accent-ketchup-default',
        tone === 'fixed' &&
          'bg-accent-avocado-flat text-accent-avocado-default',
        tone === 'branch' && 'bg-surface-float text-text-secondary',
      )}
      style={
        from !== undefined ? { marginLeft: `${branchOffsetRem(from)}rem` } : {}
      }
    >
      {from !== undefined ? `↳ ${label}` : label}
    </span>
    <div
      className="flex items-start"
      style={
        from !== undefined ? { marginLeft: `${branchOffsetRem(from)}rem` } : {}
      }
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.title}>
          {index > 0 && <Connector label={step.via} />}
          <div className="flex shrink-0 flex-col gap-3">
            <StepCard step={step} />
            {step.notes?.map((note, noteIndex) => (
              <Sticky
                // eslint-disable-next-line react/no-array-index-key
                key={noteIndex}
                tone={note.tone}
                index={index + noteIndex}
                className={STEP_WIDTH}
              >
                {note.text}
              </Sticky>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
);

export const Metric = ({
  value,
  label,
}: {
  value: string;
  label: string;
}): ReactElement => (
  <div className="flex flex-col rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2">
    <span className="font-bold typo-title3">{value}</span>
    <span className="text-text-tertiary typo-caption1">{label}</span>
  </div>
);

export const frameIcons = {
  core: <CoreIcon size={IconSize.Small} />,
  boost: <BoostIcon size={IconSize.Small} />,
  award: <MedalIcon size={IconSize.Small} />,
  bell: <BellIcon size={IconSize.Small} />,
  card: <CreditCardIcon size={IconSize.Small} />,
  warning: <WarningIcon size={IconSize.Small} />,
  sparkle: <SparkleIcon size={IconSize.Small} />,
};

export const Frame = ({
  id,
  number,
  title,
  icon,
  summary,
  metrics,
  children,
  className,
}: {
  id: string;
  number: string;
  title: string;
  icon?: ReactElement;
  summary?: ReactNode;
  metrics?: { value: string; label: string }[];
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <section
    data-frame={id}
    className={classNames('flex flex-col', className ?? 'w-max')}
  >
    <span className="mb-2 px-1 text-text-tertiary typo-callout">
      {number} · {title}
    </span>
    <div className="flex flex-col gap-8 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-10 shadow-2">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex size-10 items-center justify-center rounded-12 bg-surface-float">
              {icon}
            </span>
          )}
          <h2 className="font-bold typo-large-title">{title}</h2>
        </div>
        {summary && (
          <div className="max-w-[80ch] text-text-secondary typo-body">
            {summary}
          </div>
        )}
        {metrics && (
          <div className="flex flex-wrap gap-3">
            {metrics.map((metric) => (
              <Metric key={metric.label} {...metric} />
            ))}
          </div>
        )}
      </header>
      {children}
    </div>
  </section>
);

interface View {
  x: number;
  y: number;
  scale: number;
}

const MIN_SCALE = 0.04;
const MAX_SCALE = 2;
const clamp = (value: number): number =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

export const Board = ({
  frames,
  children,
}: {
  frames: { id: string; title: string }[];
  children: ReactNode;
}): ReactElement => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 0.3 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const fitRect = useCallback(
    (left: number, top: number, width: number, height: number) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }
      const padding = 48;
      const toolbar = 72;
      const availableWidth = viewport.clientWidth - padding * 2;
      const availableHeight = viewport.clientHeight - padding * 2 - toolbar;
      const scale = clamp(
        Math.min(availableWidth / width, availableHeight / height),
      );
      setIsAnimating(true);
      setView({
        scale,
        x: (viewport.clientWidth - width * scale) / 2 - left * scale,
        y:
          padding +
          toolbar +
          (availableHeight - height * scale) / 2 -
          top * scale,
      });
    },
    [],
  );

  const fitAll = useCallback(() => {
    const content = contentRef.current;
    if (content) {
      fitRect(0, 0, content.offsetWidth, content.offsetHeight);
    }
  }, [fitRect]);

  const goToFrame = useCallback(
    (id: string) => {
      const frame = contentRef.current?.querySelector<HTMLElement>(
        `[data-frame="${id}"]`,
      );
      if (frame) {
        fitRect(
          frame.offsetLeft,
          frame.offsetTop,
          frame.offsetWidth,
          frame.offsetHeight,
        );
      }
    },
    [fitRect],
  );

  const zoomAt = useCallback((factor: number, cx?: number, cy?: number) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const originX = cx ?? viewport.clientWidth / 2;
    const originY = cy ?? viewport.clientHeight / 2;
    setView((current) => {
      const scale = clamp(current.scale * factor);
      const ratio = scale / current.scale;
      return {
        scale,
        x: originX - (originX - current.x) * ratio,
        y: originY - (originY - current.y) * ratio,
      };
    });
  }, []);

  useEffect(() => {
    // Fonts and icons settle the frame sizes a beat after mount.
    const timeout = setTimeout(fitAll, 150);
    return () => clearTimeout(timeout);
  }, [fitAll]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return undefined;
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setIsAnimating(false);
      if (event.ctrlKey || event.metaKey) {
        const rect = viewport.getBoundingClientRect();
        zoomAt(
          Math.exp(-event.deltaY * 0.01),
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
        return;
      }
      setView((current) => ({
        ...current,
        x: current.x - event.deltaX,
        y: current.y - event.deltaY,
      }));
    };
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        return;
      }
      if (event.key === '+' || event.key === '=') {
        zoomAt(1.2);
      } else if (event.key === '-') {
        zoomAt(1 / 1.2);
      } else if (event.key === '0' || event.key === 'f') {
        fitAll();
      } else {
        const index = Number(event.key) - 1;
        if (frames[index]) {
          goToFrame(frames[index].id);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fitAll, frames, goToFrame, zoomAt]);

  const dotSize = 24 * view.scale;

  return (
    <div
      ref={viewportRef}
      className={classNames(
        'relative h-screen w-full touch-none select-none overflow-hidden bg-background-default',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
      )}
      style={{
        backgroundImage:
          'radial-gradient(var(--theme-border-subtlest-secondary) 1px, transparent 1px)',
        backgroundSize: `${dotSize}px ${dotSize}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('[data-board-ui]')) {
          return;
        }
        drag.current = { x: event.clientX, y: event.clientY };
        setIsDragging(true);
        setIsAnimating(false);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current) {
          return;
        }
        const dx = event.clientX - drag.current.x;
        const dy = event.clientY - drag.current.y;
        drag.current = { x: event.clientX, y: event.clientY };
        setView((current) => ({
          ...current,
          x: current.x + dx,
          y: current.y + dy,
        }));
      }}
      onPointerUp={() => {
        drag.current = null;
        setIsDragging(false);
      }}
    >
      <div
        ref={contentRef}
        className={classNames(
          'absolute left-0 top-0 origin-top-left',
          isAnimating && 'transition-transform duration-500 ease-out',
        )}
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
        onTransitionEnd={() => setIsAnimating(false)}
      >
        {children}
      </div>

      <nav
        data-board-ui
        className="absolute left-4 right-4 top-4 flex cursor-default items-center gap-1 overflow-x-auto rounded-16 border border-border-subtlest-tertiary bg-background-default p-1.5 shadow-2"
      >
        {frames.map((frame, index) => (
          <button
            key={frame.id}
            type="button"
            onClick={() => goToFrame(frame.id)}
            className="flex shrink-0 items-center gap-1.5 rounded-10 px-2.5 py-1.5 text-text-secondary typo-footnote hover:bg-surface-float hover:text-text-primary"
          >
            <span className="text-text-quaternary">{index + 1}</span>
            {frame.title}
          </button>
        ))}
      </nav>

      <div
        data-board-ui
        className="absolute bottom-4 right-4 flex cursor-default items-center gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-default p-1.5 shadow-2"
      >
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomAt(1 / 1.2)}
          className="flex size-8 items-center justify-center rounded-10 hover:bg-surface-float"
        >
          <MinusIcon size={IconSize.Small} />
        </button>
        <span className="w-12 text-center tabular-nums text-text-secondary typo-footnote">
          {Math.round(view.scale * 100)}%
        </span>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomAt(1.2)}
          className="flex size-8 items-center justify-center rounded-10 hover:bg-surface-float"
        >
          <PlusIcon size={IconSize.Small} />
        </button>
        <button
          type="button"
          onClick={fitAll}
          className="rounded-10 px-2.5 py-1.5 font-bold typo-footnote hover:bg-surface-float"
        >
          Fit
        </button>
      </div>

      <div
        data-board-ui
        className="absolute bottom-4 left-4 cursor-default rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-2 text-text-tertiary shadow-2 typo-caption1"
      >
        Drag or scroll to move · pinch or ⌘ + scroll to zoom · 1–9 jumps to a
        frame · F fits the board
      </div>
    </div>
  );
};
