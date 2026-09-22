import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { FunnelBrowserExtension } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelBrowserExtension';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  featureOnboardingExtensionShowcase,
  OnboardingChromeVariant,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { FunnelStepShell } from './signupFunnel.mocks';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';

/**
 * The extension step of `/onboarding` with the `onboarding_extension_showcase`
 * flag pinned, mounted in the same harness as the other signup funnel steps.
 */

interface StepArgs {
  chrome: OnboardingChromeVariant;
  showcase: boolean;
  headline: string;
  cta: string;
}

const step = {
  id: 'browser-extension',
  type: FunnelStepType.BrowserExtension as const,
  transitions: [],
  isActive: true,
  onTransition: fn(),
};

const meta: Meta<StepArgs> = {
  title: 'Components/Onboarding/Steps/BrowserExtension showcase',
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
  argTypes: {
    chrome: {
      control: { type: 'inline-radio' },
      options: Object.values(OnboardingChromeVariant),
    },
    showcase: {
      description: 'The `onboarding_extension_showcase` flag.',
    },
  },
  args: {
    chrome: OnboardingChromeVariant.Control,
    showcase: true,
    headline: 'Transform every new tab into a learning powerhouse',
    cta: 'Add to {browser}',
  },
  render: ({ chrome, showcase, headline, cta }) => {
    const props = { ...step, parameters: { headline, cta } };

    return (
      <FeatureOverrides
        values={{ [featureOnboardingExtensionShowcase.id]: showcase }}
      >
        <FunnelStepShell chrome={chrome} step={props} stepIndex={8} fullWidth>
          <FunnelBrowserExtension {...props} />
        </FunnelStepShell>
      </FeatureOverrides>
    );
  },
};

export default meta;
type Story = StoryObj<StepArgs>;

export const Showcase: Story = {};

export const Control: Story = {
  name: 'Control (video)',
  args: { showcase: false },
};

const RESOLUTIONS = [
  { label: 'MacBook Air 13" scaled', width: 1280, height: 720 },
  { label: 'iPad landscape / small laptop', width: 1024, height: 768 },
  { label: 'HD laptop', width: 1366, height: 768 },
  { label: 'MacBook Air default', width: 1440, height: 900 },
];

/**
 * Each frame is a real iframe so `laptop:` breakpoints and `100dvh` resolve
 * against that frame's own size, exactly as they would on a screen of that
 * resolution. Frames are scaled to fit.
 */
export const Resolutions: Story = {
  name: 'Small resolutions',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex min-h-dvh flex-col gap-8 bg-background-subtle p-6">
      {RESOLUTIONS.map(({ label, width, height }) => {
        const scale = Math.min(1, 1200 / width);

        return (
          <figure key={label} className="flex flex-col gap-2">
            <figcaption className="text-text-tertiary typo-footnote">
              {label} · {width}×{height}
            </figcaption>
            <div
              className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
              style={{ width: width * scale, height: height * scale }}
            >
              <iframe
                title={label}
                src="/iframe.html?id=components-onboarding-steps-browserextension-showcase--showcase&viewMode=story"
                style={{
                  width,
                  height,
                  border: 0,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              />
            </div>
          </figure>
        );
      })}
    </div>
  ),
};
