import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { StoryObj } from '@storybook/react-vite';
import { bareStory } from './frames';

// A story at a real viewport, scaled to its column. Lazy, so a page of many
// frames only loads the ones on screen instead of compiling them all at once.
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
  const [scale, setScale] = useState(0.5);

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

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <iframe
        title={title}
        src={`iframe.html?id=${storyId}&viewMode=story`}
        loading="lazy"
        className="absolute left-0 top-0 origin-top-left"
        style={{ width, height, transform: `scale(${scale})` }}
      />
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
const DeviceStage = ({
  device,
  storyId,
  before,
}: {
  device: Device;
  storyId: string;
  before?: string;
}): ReactElement => (
  <div className="flex min-h-screen flex-col items-center gap-4 bg-background-subtle px-4 py-6">
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
