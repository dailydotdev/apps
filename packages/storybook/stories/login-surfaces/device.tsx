import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { StoryObj } from '@storybook/react-vite';
import { bareStory } from './frames';

// Pages here embed many live stories, and each one pulls hundreds of modules
// from the dev server. Started together, some of those requests fail and the
// frame lands on Storybook's error screen, so frames take turns: each starts
// once it is near the screen, at most two at a time.
const MAX_LOADING = 2;
const LOAD_TIMEOUT_MS = 20000;
let loading = 0;
const waiting: (() => void)[] = [];

const takeTurn = (start: () => void): void => {
  if (loading < MAX_LOADING) {
    loading += 1;
    start();
    return;
  }
  waiting.push(start);
};

const finishTurn = (): void => {
  loading -= 1;
  const next = waiting.shift();
  if (next) {
    loading += 1;
    next();
  }
};

// A story at a real viewport, scaled to its column.
export const LiveFrame = ({
  storyId,
  title,
  width,
  height,
}: {
  storyId: string;
  title: string;
  width: number;
  height: number;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / width),
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    let hasTurn = false;
    let isDone = false;
    let poll: ReturnType<typeof setInterval> | undefined;
    const done = (): void => {
      if (hasTurn && !isDone) {
        isDone = true;
        finishTurn();
      }
      clearInterval(poll);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        observer.disconnect();
        takeTurn(() => {
          hasTurn = true;
          setSrc(`iframe.html?id=${storyId}&viewMode=story`);
          const startedAt = Date.now();
          let hasRetried = false;
          poll = setInterval(() => {
            const body = frameRef.current?.contentDocument?.body;
            if (body?.classList.contains('sb-show-main')) {
              done();
            } else if (
              body?.classList.contains('sb-show-errordisplay') &&
              !hasRetried
            ) {
              hasRetried = true;
              frameRef.current?.contentWindow?.location.reload();
            } else if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
              done();
            }
          }, 300);
        });
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      done();
    };
  }, [storyId]);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {src && (
        <iframe
          ref={frameRef}
          title={title}
          src={src}
          className="absolute left-0 top-0 origin-top-left"
          style={{ width, height, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
};

export const img = (name: string): string =>
  `/images/login-surfaces/${name}.jpg`;

// Device stories render bare when the `bare` arg is set, which is how the
// overview pages embed them.
export type DeviceStory = StoryObj<{ bare: boolean }>;

export type Device = { name: string; width: number; height: number };

export const devices = {
  laptop: { name: 'Laptop', width: 1440, height: 900 },
  pixel: { name: 'Pixel 7 · Android', width: 412, height: 915 },
  iphone: { name: 'iPhone 17 · iOS', width: 402, height: 874 },
} satisfies Record<string, Device>;

export const StageLabel = ({
  tone,
  children,
}: {
  tone: 'before' | 'after';
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'self-start rounded-8 px-2 py-0.5 font-bold text-white typo-caption1',
      tone === 'before'
        ? 'bg-accent-ketchup-default'
        : 'bg-accent-avocado-default',
    )}
  >
    {children}
  </span>
);

// The screen at the device's real viewport, in an iframe so the funnel's
// breakpoints see the device width rather than the Storybook canvas, next to
// the production capture it replaces at the same width when there is one.
// Phones render 1:1; the laptop scales down to fit the canvas.
export const DevicePair = ({
  device,
  storyId,
  before,
}: {
  device: Device;
  storyId: string;
  before?: string;
}): ReactElement => (
  <div className="flex w-full flex-col items-center gap-4">
    <p className="text-text-tertiary typo-footnote">
      {device.name} · {device.width} × {device.height}
    </p>
    <div className="flex w-full flex-wrap items-start justify-center gap-6">
      {before && (
        <figure
          className="flex min-w-0 flex-1 flex-col gap-2"
          style={{ maxWidth: device.width }}
        >
          <StageLabel tone="before">Before · production</StageLabel>
          <img
            src={img(before)}
            alt="Before"
            className="block w-full rounded-16 border border-border-subtlest-tertiary"
          />
        </figure>
      )}
      <figure
        className="flex min-w-0 flex-1 flex-col gap-2"
        style={{ maxWidth: device.width }}
      >
        {before && <StageLabel tone="after">After · aligned</StageLabel>}
        <LiveFrame
          storyId={bareStory(storyId)}
          title={device.name}
          width={device.width}
          height={device.height}
        />
      </figure>
    </div>
  </div>
);

const DeviceStage = (props: {
  device: Device;
  storyId: string;
  before?: string;
}): ReactElement => (
  <div className="flex min-h-screen flex-col bg-background-subtle px-4 py-6">
    <DevicePair {...props} />
  </div>
);

export const onDevice = (
  device: Device,
  before: string | undefined,
  screen: () => ReactElement,
): Pick<DeviceStory, 'args' | 'argTypes' | 'render'> => ({
  args: { bare: false },
  argTypes: { bare: { table: { disable: true } } },
  render: (args, { id }) =>
    args.bare ? (
      screen()
    ) : (
      <DeviceStage device={device} storyId={id} before={before} />
    ),
});
