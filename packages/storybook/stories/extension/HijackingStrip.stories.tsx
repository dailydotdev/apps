import React from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HijackingVariant } from '@dailydotdev/shared/src/lib/featureManagement';
import HijackingLoginStrip from 'extension/src/newtab/HijackingLoginStrip';
import ExtensionProviders, { bootAsAnonymous } from './_providers';
import { FeatureOverrides } from '../../mock/GrowthBookProvider';

const ARM_NOTES: Record<HijackingVariant, string> = {
  [HijackingVariant.Default]: 'control — left-aligned, cat',
  [HijackingVariant.CTA]: 'cat stage hero — dual CTA, hands off to webapp',
  [HijackingVariant.Auth]: 'previous winner — centered, inline auth',
  [HijackingVariant.Cover]: 'new — homepage cover art, centered copy',
};

const Strip = ({ variant }: { variant: HijackingVariant }): ReactElement => (
  <ExtensionProviders>
    <FeatureOverrides values={{ hijacking_variants3: variant }}>
      <div className="dark min-h-dvh bg-background-default p-6">
        <p className="mb-4 text-text-tertiary typo-footnote">
          <strong className="text-text-secondary">{variant}</strong> —{' '}
          {ARM_NOTES[variant]}
        </p>
        <div className="mx-auto max-w-[60rem]">
          <HijackingLoginStrip />
        </div>
      </div>
    </FeatureOverrides>
  </ExtensionProviders>
);

const meta: Meta<typeof Strip> = {
  title: 'Extension/HijackingStrip',
  component: Strip,
  beforeEach: bootAsAnonymous,
  parameters: {
    layout: 'fullscreen',
    themes: { themeOverride: 'dark' },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(HijackingVariant),
    },
  },
};

export default meta;

type Story = StoryObj<typeof Strip>;

export const Cover: Story = {
  args: { variant: HijackingVariant.Cover },
};

export const AuthPreviousWinner: Story = {
  args: { variant: HijackingVariant.Auth },
};

export const CatCta: Story = {
  args: { variant: HijackingVariant.CTA },
};

export const Control: Story = {
  args: { variant: HijackingVariant.Default },
};
