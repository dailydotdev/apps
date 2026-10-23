import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section, stepStory, ViewportFrame } from './harness';

/**
 * Every frame is the real story at a real viewport, so Tailwind's
 * breakpoints (mobileL 420, mobileXL 500, tablet 656, laptop 1020, laptopL
 * 1360, laptopXL 1668, desktop 1976) apply as they do on a device.
 */

const meta: Meta = {
  title: 'Features/Onboarding/Acquisition open field/2. Breakpoints',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export default meta;

const PHONES = [
  { label: 'Small phone', width: 320, height: 568 },
  { label: 'iPhone SE', width: 375, height: 667 },
  { label: 'iPhone 15', width: 393, height: 852 },
  { label: 'Large phone (mobileL)', width: 430, height: 932 },
];

const PHONE_SPECIAL = [
  { label: 'Keyboard open (visible area)', width: 390, height: 460 },
  { label: 'Phone landscape', width: 844, height: 390 },
];

const LARGER = [
  { label: 'Tablet portrait', width: 768, height: 1024 },
  { label: 'Laptop', width: 1280, height: 800 },
  { label: 'Laptop L', width: 1440, height: 900 },
  { label: 'Desktop (laptopXL)', width: 1920, height: 1080 },
  { label: 'Wide desktop (desktop)', width: 2560, height: 1440 },
];

export const Breakpoints: StoryObj = {
  name: 'All breakpoints',
  render: (): ReactElement => (
    <Page
      eyebrow="Acquisition open field · 2"
      title="Every breakpoint, mobile first"
      intro={
        <>
          Each frame is the live story at that viewport, typed into by its play
          function, so you can also click and type inside any frame. Phones keep
          the CTA pinned by the thumb; from tablet up it follows the field.
        </>
      }
    >
      <Section title="Onboarding step on phones">
        <div className="grid grid-cols-1 gap-6 mobileXL:grid-cols-2 laptop:grid-cols-4">
          {PHONES.map((frame) => (
            <ViewportFrame
              key={frame.label}
              storyId={stepStory('filled')}
              {...frame}
            />
          ))}
        </div>
      </Section>
      <Section
        title="Keyboard open and landscape"
        note="With the keyboard up only the top of the screen is visible: the headline, the field and the hint stay above it."
      >
        <div className="grid grid-cols-1 gap-6 laptop:grid-cols-[1fr_2fr]">
          {PHONE_SPECIAL.map((frame) => (
            <ViewportFrame
              key={frame.label}
              storyId={stepStory('filled')}
              {...frame}
            />
          ))}
        </div>
      </Section>
      <Section title="Onboarding step from tablet to wide desktop">
        <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
          {LARGER.map((frame) => (
            <ViewportFrame
              key={frame.label}
              storyId={stepStory('filled')}
              {...frame}
            />
          ))}
        </div>
      </Section>
    </Page>
  ),
};
