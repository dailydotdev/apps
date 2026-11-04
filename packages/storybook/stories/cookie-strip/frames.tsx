import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import type { Device } from './kit';

/* ------------------------------------------------------------------------ */
/* Frames: the hidden frame story in an iframe at a real viewport size, so   */
/* the strip's breakpoints and the card's fixed geometry behave as shipped.  */
/* ------------------------------------------------------------------------ */

const FRAME_STORY =
  'cookie-banner-signup-strip-frame--cookie-strip-frame-story';

export interface FrameArgs {
  variant: string;
  cookie: string;
  consent: string;
  /** Headline copy: `geo` (GeoPersonalizedBanner) or `default`. */
  copy: string;
}

export type Theme = 'dark' | 'light';

const frameSrc = (args: FrameArgs, theme: Theme): string => {
  const parts = Object.entries(args)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return `iframe.html?id=${FRAME_STORY}&viewMode=story&globals=theme:${theme}&args=${encodeURIComponent(
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

export const useWidth = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
};

const MAX_RETRIES = 3;

/** One device, scaled to `width` (never up). */
export const Frame = ({
  args,
  theme,
  device,
  width,
  index,
  title,
}: {
  args: FrameArgs;
  theme: Theme;
  device: Device;
  width: number;
  index: number;
  title: string;
}): ReactElement => {
  const { loaded, done } = useContext(QueueContext);
  const ref = useRef<HTMLIFrameElement>(null);
  const timer = useRef<number>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => () => window.clearInterval(timer.current), []);
  const scale = Math.min(1, width / device.width);

  // `load` fires when the HTML arrives, long before the story's modules
  // have been fetched; wait for the frame to render instead, and reload one
  // the dev server dropped a module for.
  const watch = () => {
    const started = Date.now();
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const doc = ref.current?.contentDocument;
      const rendered = !!doc?.querySelector('[data-frame-ready] article');
      const failed = /Failed to fetch dynamically imported module/.test(
        doc?.querySelector('#error-message')?.textContent ?? '',
      );
      if (failed && attempt < MAX_RETRIES) {
        window.clearInterval(timer.current);
        setAttempt((n) => n + 1);
        return;
      }
      if (rendered || failed || Date.now() - started > 30_000) {
        window.clearInterval(timer.current);
        done(index);
      }
    }, 250);
  };

  return (
    <div
      className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default"
      style={{ width: device.width * scale, height: device.height * scale }}
    >
      {index > loaded || !width ? (
        <p className="p-4 text-text-quaternary typo-footnote">Loading…</p>
      ) : (
        <iframe
          key={attempt}
          ref={ref}
          title={title}
          src={frameSrc(args, theme)}
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

export const DeviceLabel = ({ device }: { device: Device }): ReactElement => (
  <p className="flex items-baseline gap-2 text-text-tertiary typo-footnote">
    <span className="font-bold text-text-primary">{device.name}</span>
    <span className="tabular-nums">
      {device.width} × {device.height}
    </span>
    {device.note && (
      <span className="rounded-6 bg-surface-float px-1.5 typo-caption1">
        {device.note}
      </span>
    )}
  </p>
);

export const Toggle = <T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}): ReactElement => (
  <div className="flex items-center gap-2">
    <span className="text-text-tertiary typo-footnote">{label}</span>
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
  </div>
);
