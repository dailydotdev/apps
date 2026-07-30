import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

// =============================================================
// Side-by-side comparison of the signup wall backgrounds.
//
// Each frame is a real <iframe> rather than a scaled-down div on
// purpose: breakpoints here come from the viewport, both in CSS
// (`tablet:` / `laptop:`) and in JS (`useViewSize`). Two columns
// on one page would both report the parent's width and render the
// desktop layout, which is exactly the thing this page exists to
// check. An iframe gets its own viewport, so each frame lays out
// as if it were a device of that size.
// =============================================================

type Frame = {
  label: string;
  storyId: string;
  note?: string;
};

const FRAMES: Frame[] = [
  {
    label: 'Cards',
    storyId: 'components-onboarding-steps-funnelherolanding--cards',
    note: 'today — code default',
  },
  {
    label: 'Desk',
    storyId: 'components-onboarding-steps-funnelherolanding--desk',
    note: 'today — photo backdrop',
  },
  {
    label: 'Panel',
    storyId: 'components-onboarding-steps-funnelherolanding--panel',
    note: 'new — framed split',
  },
];

type ComparisonProps = {
  width: number;
  height: number;
  only: string;
};

const Comparison = ({ width, height, only }: ComparisonProps) => {
  const frames =
    only === 'all' ? FRAMES : FRAMES.filter((frame) => frame.label === only);

  return (
    <div className="min-h-dvh bg-background-subtle p-6">
      <p className="mb-6 text-text-tertiary typo-footnote">
        {width}×{height} — each frame is its own viewport, so breakpoints behave
        exactly as they would on a device of this size.
      </p>
      <div className="flex flex-row items-start gap-6 overflow-x-auto pb-4">
        {frames.map((frame) => (
          <figure className="flex shrink-0 flex-col gap-2" key={frame.storyId}>
            <figcaption className="flex items-baseline gap-2">
              <span className="font-bold text-text-primary typo-callout">
                {frame.label}
              </span>
              {frame.note && (
                <span className="text-text-tertiary typo-caption1">
                  {frame.note}
                </span>
              )}
            </figcaption>
            <iframe
              className="rounded-16 border border-border-subtlest-tertiary bg-background-default"
              height={height}
              src={`/iframe.html?id=${frame.storyId}&viewMode=story`}
              title={frame.label}
              width={width}
            />
          </figure>
        ))}
      </div>
    </div>
  );
};

const meta: Meta<typeof Comparison> = {
  title: 'Components/Onboarding/Signup wall comparison',
  component: Comparison,
  parameters: {
    layout: 'fullscreen',
    themes: { themeOverride: 'dark' },
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 1440, step: 8 } },
    height: { control: { type: 'range', min: 568, max: 1024, step: 8 } },
    only: {
      control: 'select',
      options: ['all', ...FRAMES.map((frame) => frame.label)],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Comparison>;

/** iPhone 14/15 logical size — below the `tablet` (656px) breakpoint. */
export const Mobile: Story = {
  args: { width: 390, height: 844, only: 'all' },
};

/** Smallest phone we support — the tightest test for wrapping and spacing. */
export const MobileSmall: Story = {
  args: { width: 320, height: 568, only: 'all' },
};

/** Between `tablet` (656px) and `laptop` (1020px): splits have not kicked in. */
export const Tablet: Story = {
  args: { width: 834, height: 1024, only: 'all' },
};

/** Above `laptop` (1020px), where the split layouts take over. */
export const Desktop: Story = {
  args: { width: 1440, height: 900, only: 'all' },
};
