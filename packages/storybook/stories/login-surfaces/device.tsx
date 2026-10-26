import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { StoryObj } from '@storybook/react-vite';
import { DesktopFrame } from '../onboarding-fixes/kit';
import { bareStory } from './frames';

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
        <DesktopFrame
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
