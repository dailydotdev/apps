import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useRef, useState } from 'react';
import classNames from 'classnames';

/* ------------------------------------------------------------------------ */
/* Frames: a hidden story rendered in an iframe at a real viewport width,    */
/* so media queries, column counts and the shell behave as they would.       */
/* ------------------------------------------------------------------------ */

export const FRAME_STORY = 'experiments-card-actions-frames--feed-frame-story';

export interface FrameArgs {
  concept: string;
  gap: number;
  side: number;
  sidebar?: 'open' | 'closed';
  seed?: number;
}

export const frameSrc = (args: FrameArgs): string => {
  const parts = Object.entries(args)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return `iframe.html?id=${FRAME_STORY}&viewMode=story&globals=theme:dark&args=${encodeURIComponent(
    parts,
  )}`;
};

/**
 * Frames on one page load one after another: a dozen stories starting at
 * once make the dev server drop dynamic imports.
 */
const QueueContext = createContext<{
  loaded: number;
  done: (index: number) => void;
}>({ loaded: Infinity, done: () => undefined });

export const FrameQueue = ({ children }: { children: ReactNode }) => {
  const [loaded, setLoaded] = useState(0);
  return (
    <QueueContext.Provider
      value={{
        loaded,
        done: (index) => setLoaded((n) => Math.max(n, index + 1)),
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export interface Device {
  name: string;
  width: number;
  height: number;
}

/**
 * Grid cards only render from 1,020px; below that production uses list
 * cards. 1,260px with the sidebar open is the narrowest grid card there is
 * (292px, three columns).
 */
export const DEVICES: Device[] = [
  { name: 'Narrowest grid', width: 1260, height: 800 },
  { name: 'Laptop', width: 1440, height: 900 },
  { name: 'Desktop', width: 1680, height: 1050 },
  { name: 'Full HD', width: 1920, height: 1080 },
  { name: 'Tablet (list)', width: 834, height: 1112 },
  { name: 'Phone (list)', width: 390, height: 844 },
];

export const GRID_DEVICES = DEVICES.filter((d) => d.width >= 1020);

const MAX_RETRIES = 3;

export const Frame = ({
  args,
  device,
  scale,
  index,
  title,
}: {
  args: FrameArgs;
  device: Device;
  scale: number;
  index: number;
  title: string;
}): ReactElement => {
  const { loaded, done } = useContext(QueueContext);
  const ref = useRef<HTMLIFrameElement>(null);
  const [attempt, setAttempt] = useState(0);

  // An iframe's `load` fires when its HTML arrives, long before the story's
  // modules have been fetched, so the next frame would start too early. Wait
  // for the cards to render instead; if the dev server dropped a module
  // ("Failed to fetch dynamically imported module"), reload the frame.
  const watch = () => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const doc = ref.current?.contentDocument;
      const rendered = !!doc?.querySelector('#storybook-root article');
      const failed = /Failed to fetch dynamically imported module/.test(
        doc?.querySelector('#error-message')?.textContent ?? '',
      );
      if (failed && attempt < MAX_RETRIES) {
        window.clearInterval(timer);
        setAttempt((n) => n + 1);
        return;
      }
      if (rendered || failed || Date.now() - started > 30_000) {
        window.clearInterval(timer);
        done(index);
      }
    }, 250);
  };

  return (
    <div
      className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default"
      style={{ width: device.width * scale, height: device.height * scale }}
    >
      {index > loaded ? (
        <p className="p-4 text-text-quaternary typo-footnote">Loading…</p>
      ) : (
        <iframe
          key={attempt}
          ref={ref}
          title={title}
          src={frameSrc(args)}
          onLoad={watch}
          style={{
            width: device.width,
            height: device.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            border: 0,
          }}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* Wipe: two frames stacked, a handle reveals "after" over "before".         */
/* ------------------------------------------------------------------------ */

export const Wipe = ({
  before,
  after,
  device,
  scale,
  index,
}: {
  before: FrameArgs;
  after: FrameArgs;
  device: Device;
  scale: number;
  index: number;
}): ReactElement => {
  const [split, setSplit] = useState(50);
  const width = device.width * scale;
  const height = device.height * scale;
  return (
    <div className="flex flex-col gap-2">
      <div className="relative" style={{ width, height }}>
        <div className="absolute inset-0">
          <Frame
            args={before}
            device={device}
            scale={scale}
            index={index}
            title="Before"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${split}%)` }}
        >
          <Frame
            args={after}
            device={device}
            scale={scale}
            index={index + 1}
            title="After"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent-cabbage-default"
          style={{ left: `${split}%` }}
        />
        <span className="pointer-events-none absolute left-2 top-2 rounded-6 bg-background-default px-1.5 font-bold text-accent-ketchup-default typo-caption1">
          Before
        </span>
        <span className="pointer-events-none absolute right-2 top-2 rounded-6 bg-background-default px-1.5 font-bold text-accent-avocado-default typo-caption1">
          After
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={split}
        onChange={(e) => setSplit(Number(e.target.value))}
        aria-label="Before / after split"
        style={{ width }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------------ */

export const Toggle = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}): ReactElement => (
  <div className="flex gap-1 rounded-12 border border-border-subtlest-tertiary p-1">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={classNames(
          'rounded-8 px-3 py-1 font-bold typo-footnote',
          o.value === value
            ? 'bg-surface-float text-text-primary'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);
